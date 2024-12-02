const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { generateContentForInHouse, generateImage } = require("../../vertex");
const { v4: uuidv4 } = require("uuid"); // Import UUID
const {sendNotifications} = require("../../utils/notification")

const generateInHouseDrink = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = req.user;
    const { ingredient, drink } = req.body;

    const ingredientCheckPromise =
      ingredient.length > 0
        ? await prisma.ingredient.findFirst({
            where: {
              ingredientName: {
                in: ingredient,
              },
            },
          })
        : Promise.resolve(true);

    const drinkCheckPromise =
      drink.length > 0
        ? prisma.drink.findFirst({
            where: {
              drinkName: {
                in: drink,
              },
            },
          })
        : Promise.resolve(true);

    // Execute both promises in parallel
    const [findIngredient, findDrink] = await Promise.all([
      ingredientCheckPromise,
      drinkCheckPromise,
    ]);

    if (ingredient.length > 0 && !findIngredient) {
      throw new NotFoundError("Ingredient Not Found");
    }

    if (drink.length > 0 && !findDrink) {
      throw new NotFoundError("Drink Not Found");
    }

    // Generate the recipe
    const recipeResultPromise = generateContentForInHouse(drink, ingredient);

    const recipeResult = await recipeResultPromise;

    console.log(recipeResult, "recipeResult");

    const existRecipe = await prisma.inhousedrink.findFirst({
      where: {
        title: recipeResult.recipeName,
        userId: id,
      },
    });

    if (existRecipe) {
      return handlerOk(res, 201, existRecipe, "My drink Added Successfully");
    }

    const imagePrompt = `an image of ${recipeResult.recipeName}`;
    const extractedDrinkName = imagePrompt.replace(/\s+/g, "_");
    const filename = `${extractedDrinkName}.png`;

    const imageUrlPromise = generateImage(imagePrompt, filename);

    // Save drink to the database with imageUrl (or fallback)
    const [imageUrl] = await Promise.allSettled([imageUrlPromise]).then(
      (results) =>
        results.map((result) =>
          result.status === "fulfilled"
            ? result.value
            : "https://ginge-backend.s3.us-east-2.amazonaws.com/mydrink/an_image_of_Long_Island_Iced_Tea.png"
        )
    );

    // Save drink to the database
    const saveDrink = await prisma.inhousedrink.create({
      data: {
        // id: newDrinkId,
        title: recipeResult.recipeName,
        ingredient: recipeResult.ingredients,
        procedure: recipeResult.instructions,
        userId: id,
        img: imageUrl,
      },
    });

    recipeResult["name"] = recipeResult?.recipeName;
    recipeResult["image"] = imageUrl || "";
    delete recipeResult["recipeName"];
    const findDrinkRecord = await prisma.drinkRecord.findFirst({
      where: {
        name: recipeResult?.name,
      },
    });

    if (!findDrinkRecord) {
      await prisma.drinkRecord.create({
        data: {
          ...recipeResult,
        },
      });
    }

    const notificationData = {
      userId: id,
      isNotify: user?.isNotify,
      fcmToken: user?.deviceToken,
    };
    const notificationContent = {
      title: "In-House drink",
      body: "Congrats! You have generated new in-house drink"
    };

    await sendNotifications(
      notificationData,
      notificationContent
    );

    handlerOk(res, 201, saveDrink, "My drink Added Successfully");
  } catch (error) {
    next(error);
  }
};

const getInHouseDrinks = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findMyDrink = await prisma.inhousedrink.findMany({
      where: {
        userId: id,
      },
    });

    if (!findMyDrink) {
      throw new NotFoundError("Drinks Not Found");
    }

    handlerOk(res, 200, findMyDrink, "Drinks Found Successfully");
  } catch (error) {
    next(error);
  }
};

const getSingleInHouseDrinks = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    const { id } = req.user;
    //find drink

    const findDrink = await prisma.inhousedrink.findFirst({
      where: {
        id: drinkId,
        userId: id,
      },
    });

    if (!findDrink) {
      throw new NotFoundError("Drink Not Found");
    }

    handlerOk(res, 200, findDrink, "Drink Found Successfully");
  } catch (error) {
    next(error);
  }
};

// const deleteSingleInHouseDrinks = async (req, res, next) => {
//   try {
//     const { drinkId } = req.params;
//     const { id } = req.user;
//     const findMyDrink = await prisma.inhousedrink.findFirst({
//       where: {
//         id: drinkId,
//         userId: id,
//       },
//     });

//     if (!findMyDrink) {
//       throw new NotFoundError("Drinks Not Found");
//     }

//     await prisma.inhousedrink.delete({
//       where: {
//         id: findMyDrink.id,
//       },
//     });

//     handlerOk(res, 200, null, "my drinks delete successfully");
//   } catch (error) {
//     next(error);
//   }
// };
module.exports = {
  generateInHouseDrink,
  getInHouseDrinks,
  getSingleInHouseDrinks,
  // deleteSingleInHouseDrinks,
};
