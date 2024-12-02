const JSONQuestion = require("./question.json")
const responseQuestion = require("./supportiveResponse.json")
const prisma = require("../config/prismaConfig");
const { famousDrinkSInTown, generateImage, generateContentForInHouse } = require("../vertex");

const handleQuestionGeneration = () => {
    const keys = Object.keys(JSONQuestion);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const questions = JSONQuestion[randomKey]
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return { id: randomKey, question: randomQuestion };
}

const handleRecipeProcess = async (recipeResult) => {
    const imagePrompt = `an image of ${recipeResult.recipeName}`;
    const extractedDrinkName = imagePrompt.replace(/\s+/g, "_");
    const filename = `${extractedDrinkName}.png`;
    let imageUrl;
    try {
        imageUrl = await generateImage(imagePrompt, filename);        
    } catch (error) {
        console.error("Image generation failed:", error.message);
        imageUrl = "https://ginge-backend.s3.us-east-2.amazonaws.com/mydrink/an_image_of_Long_Island_Iced_Tea.png";
    }

    recipeResult["name"] = recipeResult?.recipeName;
    recipeResult["image"] = imageUrl;
 
    delete recipeResult["recipeName"];

    const findDrink = await prisma.drinkRecord.findFirst({
        where: {
            name: recipeResult?.name
        }
    })

    if (!findDrink) {
        await prisma.drinkRecord.create({
            data: {
                ...recipeResult
            }
        })
    }
    return recipeResult;
}

module.exports = {
    handleQuestionGeneration,
    handleRecipeProcess
}