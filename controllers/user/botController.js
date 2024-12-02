const prisma = require("../../config/prismaConfig");
// const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
// const redis = require('redis');
// const JSONQuestion = require("../../utils/question.json")
const responseQuestion = require("../../utils/supportiveResponse.json")
const { famousDrinkSInTown, generateImage, generateContentForInHouse } = require("../../vertex");
const client = require("../../config/redisClient");
const { handleQuestionGeneration, handleRecipeProcess } = require("../../utils/botHelper")

const questionGeneration = async (req, res, next) => {
    try {
        const { id } = req.user;

        // Get cached data from Redis
        let redisData = await client.get(id);
        redisData = redisData ? JSON.parse(redisData) : null;

        // Generate a new question
        let data = handleQuestionGeneration();

        // Avoid duplication
        if (redisData && data?.id === redisData?.id) {
            do {
                data = handleQuestionGeneration();
            } while (data?.id === redisData?.id);
        }

        // Set the new question in Redis with expiration
        const newRedisData = { id: data?.id, randomQuestion: data?.question };
        await client.set(id, JSON.stringify(newRedisData));

        await client.expire(id, 120);
        console.log("Set with expiration.");

        handlerOk(res, 200, { id: newRedisData?.id, response: newRedisData?.randomQuestion, isSelect: true, isMultiSelect: false, options: ["Yes", "No"] }, "Generated Question Successfully");

    } catch (error) {
        next(error);
    }
}

const responseGeneration = async (req, res, next) => {
    try {
        const { id, city } = req.user;
        const { questionID } = req.query;
        let data;
        if (questionID === "1") {

            data = await handleFamousDrinks(id, city);

        } else if (questionID === "3") {

            const questions = responseQuestion["4"];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

            const results = await prisma.$queryRaw`
            SELECT category, 
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', id,
                           'name', name,
                           'ingredients', ingredients,
                           'instructions', instructions,
                           'image', image
                       )
                   ) AS records
            FROM drinkRecord
            GROUP BY category;
        `;

            let allCategories = []
            results.map(result => { allCategories.push(result.category) })
            data = { id: "4", response: randomQuestion, isSelect: true, isMultiSelect: false, options: allCategories }

        } else if (questionID === "4") {

            const { category } = req.query;
            data = await categoryDrinks(id, category)

        } else if (questionID === "6") {

            const questions = responseQuestion["7"];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

            const bar = await prisma.bar.findFirst({
                where: {
                    userId: id
                }
            })

            const drinks = await prisma.drink.findMany({
                where: {
                    barId: bar?.id
                },
                select: {
                    drinkName: true
                }
            })
            const ingredients = await prisma.ingredient.findMany({
                where: {
                    barId: bar?.id
                },
                select: {
                    ingredientName: true
                }
            })

            data = { id: "7", response: randomQuestion, isSelect: false, isMultiSelect: true, options: [...drinks, ...ingredients] }

        } else if (questionID === "7") {

            let { drinks, ingredients } = req.query;
            drinks = JSON.parse(drinks);
            ingredients = JSON.parse(ingredients);

            const key = id + " " + "7";
            data = await client.get(key);

            // Generate the recipe
            const recipeResult = await generateContentForInHouse(drinks, ingredients);

            // console.log(recipeResult, "recipeResult");
            let newRecipe;
            if (data) {
                data = JSON.parse(data);
                if (data?.options[0]?.["name"] === recipeResult?.recipeName) {
                    newRecipe = await prisma.drinkRecord.findFirst({
                        where: {
                            name: recipeResult?.name
                        }
                    })
                } else {
                    newRecipe = await handleRecipeProcess(recipeResult);
                }
            } else {
                newRecipe = await handleRecipeProcess(recipeResult);
            }

            await client.set(key, JSON.stringify({ id: "7", response: "", isSelect: false, isMultiSelect: false, options: [newRecipe] }))

            await client.expire(key, 120);
            console.log("Set with expiration.");

            data = await client.get(key);
            data = JSON.parse(data)

        } else {
            // if not a single question ID matches
        }

        handlerOk(res, 200, data, "Generated Response Successfully");

    } catch (error) {
        next(error);
    }
}

const handleFamousDrinks = async (id, city) => {
    const questions = responseQuestion["2"]
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const key = id + " " + "2";

    let data = await client.get(key);
    if (data) {

        // Cache Hit
        // data = JSON.parse(data);

        await client.expire(key, 120);
        console.log("Set with expiration.");
    } else {
        // Cache Miss
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const findDrinks = await prisma.drinkRecord.findMany({
            where: {
                town: city,
                createdAt: {
                    gte: tenDaysAgo,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 4
        });

        if (findDrinks?.length === 0) {
            // give records from DB
            await client.set(key, JSON.stringify({ id: "2", response: randomQuestion, isSelect: false, isMultiSelect: false, options: findDrinks }))
        } else {
            // Generate new records
            const towns = await famousDrinkSInTown(city);
            // const drinksWithImages = await Promise.all(towns.map(async (town) => {
            //     const imagePrompt = `an image of ${town?.name}`;
            //     const extractedDrinkName = imagePrompt.replace(/\s+/g, "_");
            //     const filename = `${extractedDrinkName}.png`;
            //     const imageUrl = await generateImage(imagePrompt, filename);
            //     town["image"] = imageUrl;
            //     // town["image"] = "https://ginge-backend.s3.us-east-2.amazonaws.com/mydrink/an_image_of_Salty_Citrus_Spritzer.png"
            //     return { ...town };
            // })
            // );

            const drinksWithImagesPromises = await Promise.allSettled(
                towns.map(async (town) => {
                    const imagePrompt = `an image of ${town?.name}`;
                    const extractedDrinkName = imagePrompt.replace(/\s+/g, "_");
                    const filename = `${extractedDrinkName}.png`;

                    try {
                        const imageUrl = await generateImage(imagePrompt, filename);
                        town["image"] = imageUrl; // Assign the generated image
                        console.log("try:")
                    } catch (error) {
                        console.log("catch:")
                        town["image"] = "https://ginge-backend.s3.us-east-2.amazonaws.com/mydrink/an_image_of_Long_Island_Iced_Tea.png"
                    }

                    return { ...town }; // Return the updated town
                })
            );

            const drinksWithImages = drinksWithImagesPromises.map(item => item.value);

            // Fetch existing drink records and recommended drinks
            const existingDrinks = await prisma.drinkRecord.findMany({
                where: { name: { in: drinksWithImages.map((drink) => drink.name) } },
                select: { name: true },
            });
            const existingDrinkNames = new Set(existingDrinks.map((drink) => drink.name));

            const existingRecommendations = await prisma.recommendeddrink.findMany({
                where: { userId: id, title: { in: drinksWithImages.map((drink) => drink.name) } },
                select: { title: true },
            });
            const existingRecommendationTitles = new Set(existingRecommendations.map((rec) => rec.title));

            const newDrinks = [];
            const recommendationDrinks = [];
            const popularCategories = new Set(["POPULAR", "LONG_ISLAND_TEA", "MOJITO", "OLD_FASHION"]);

            for (const drink of drinksWithImages) {
                if (!existingDrinkNames.has(drink.name)) {
                    newDrinks.push({
                        ...drink,
                        town: city,
                    });
                }

                if (!existingRecommendationTitles.has(drink.name)) {
                    const category = popularCategories.has(drink.category) ? drink.category : "OTHER";
                    recommendationDrinks.push({
                        title: drink.name,
                        ingredient: drink.ingredients,
                        procedure: drink.instructions,
                        category,
                        img: drink.image,
                        userId: id,
                    });
                }
            }

            // Insert new drinks into the database
            if (newDrinks.length > 0) {
                await prisma.drinkRecord.createMany({ data: newDrinks });
            }

            // Insert new recommendations into the database
            if (recommendationDrinks.length > 0) {
                await prisma.recommendeddrink.createMany({ data: recommendationDrinks });
            }

            await client.set(key, JSON.stringify({ id: "2", response: randomQuestion, isSelect: false, isMultiSelect: false, options: towns }))
        }

        await client.expire(key, 120);
        console.log("Set with expiration.");

        data = await client.get(key);
    }

    data = JSON.parse(data);
    return data;
}

const categoryDrinks = async (id, category) => {

    const questions = responseQuestion["5"];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const key = id + " " + "5";

    const allDrinks = await prisma.drinkRecord.findMany({
        where: {
            // town: city,
            category: category
        }
    })

    // Add to the preferred drinks
    const existingPreferredTitles = new Set(
        (await prisma.preferredDrink.findMany({
            where: { userId: id },
            select: { title: true }
        })).map((drink) => drink.title)
    );

    // categories to classify drinks
    const popularCategories = new Set(["POPULAR", "LONG_ISLAND_TEA", "MOJITO", "OLD_FASHION"]);

    const preferredDrink = allDrinks
        .filter((drink) => !existingPreferredTitles.has(drink?.name)) // Only include non-existing drinks
        .map((drink) => ({
            title: drink?.name,
            ingredient: drink?.ingredients,
            procedure: drink?.instructions,
            category: popularCategories.has(drink?.category) ? drink?.category : "OTHER",
            img: drink?.image,
            userId: id
        }));

    if (preferredDrink.length > 0) {
        await prisma.preferredDrink.createMany({
            data: preferredDrink
        })
    }

    await client.set(key, JSON.stringify({ id: "5", response: randomQuestion, isSelect: false, isMultiSelect: false, options: allDrinks }))

    await client.expire(key, 120);
    console.log("Set with expiration.");

    data = await client.get(key);
    data = JSON.parse(data)
    return data;
}

module.exports = {
    questionGeneration,
    responseGeneration
}