const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const {
  generateContentForTownName,
  famousDrinkSInTown,
  generateImage,
} = require("../../vertex");

const { v4: uuidv4 } = require("uuid"); // Import UUID

const generateRecommendDrink = async (req, res, next) => {
  try {
    const { id, latitude, longitude } = req.user;

    const findUser = await prisma.user.findFirst({
      where: {
        id: id,
        latitude: latitude,
        longitude: longitude,
      },
    });

    if (!findUser) {
      throw new NotFoundError("User Location Not Found");
    }

    const townName = await generateContentForTownName(
      findUser.latitude,
      findUser.longitude
    );
    console.log(townName, "townName");

    const data = await famousDrinkSInTown(townName);
    console.log(data);

    if (data) {
      const drinks = Array.isArray(data) ? data : data.drinks || [];

      // Retrieve existing drinks from the database
      const existingDrinks = await prisma.recommendeddrink.findMany({
        where: {
          userId: id,
          title: {
            in: drinks.map((drink) => drink.name || drink.drinkName),
          },
        },
      });

      // Create a set of existing drink titles for easy lookup
      const existingDrinkTitles = new Set(
        existingDrinks.map((drink) => drink.title)
      );

      // Identify missing drinks
      const missingDrinks = drinks.filter(
        (drink) => !existingDrinkTitles.has(drink.name || drink.drinkName)
      );

      if (missingDrinks.length > 0) {
        // Generate missing drinks
        const recommendedData = [];

        for (const drink of missingDrinks) {
          const drinkName = drink.name || drink.drinkName;
          const imagePrompt = `an image of ${drinkName} drink`;

          // Generate the image
          const extractedDrinkName = drinkName.replace(/\s+/g, "_");
          const filename = `${extractedDrinkName}.png`;
          const imageUrl = await generateImage(imagePrompt, filename);

          // Determine the category
          const category = categorizeDrink(drink.category);

          // const newDrinkId = uuidv4();
          recommendedData.push({
            // id: newDrinkId,
            title: drinkName,
            ingredient: drink.ingredients,
            procedure: drink.instructions,
            img: imageUrl || "",
            userId: id,
            category: category,
          });
        }

        // Save all new recommended drinks to the database
        await prisma.recommendeddrink.createMany({ data: recommendedData });
        return handlerOk(
          res,
          201,
          recommendedData,
          "New drinks added successfully"
        );
      } else {
        // All drinks already exist in the database
        return handlerOk(
          res,
          200,
          existingDrinks,
          "All drinks found in the database"
        );
      }
    } else {
      return handlerOk(res, 404, [], "No drinks found in town.");
    }
  } catch (error) {
    next(error);
  }
};

const categorizeDrink = (category) => {
  const categories = {
    POPULAR: "POPULAR",
    MOJITO: "MOJITO",
    OLD_FASHION: "OLD_FASHION",
    LONG_ISLAND_TEA: "LONG_ISLAND_TEA",
  };

  // Use Object.values instead of object.values
  for (const key of Object.values(categories)) {
    if (key === category) {
      return key;
    }
  }
  return "OTHER";
};

const getRecommendDrink = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { popular, mojito, oldfashion, longislandtea } = req.query;

    const foundRecommendedDrink = await prisma.recommendeddrink.findMany({
      where: {
        userId: id,
      },
    });

    let filteredDrinks = foundRecommendedDrink;

    if (filteredDrinks.length === 0) {
      throw new NotFoundError("No drink found.");
    }

    if (popular) {
      console.log("popular called");
      filteredDrinks = filteredDrinks.filter(
        (drink) => drink.category.toUpperCase() === "POPULAR"
      );
    }

    if (mojito) {
      console.log("mojito called");
      filteredDrinks = filteredDrinks.filter(
        (drink) => drink.category.toUpperCase() === "MOJITO"
      );
    }

    if (oldfashion) {
      console.log("oldfashion called");
      filteredDrinks = filteredDrinks.filter(
        (drink) => drink.category.toUpperCase() === "OLD_FASHION"
      );
    }

    if (longislandtea) {
      console.log("longislandtea called");
      filteredDrinks = filteredDrinks.filter(
        (drink) => drink.category.toUpperCase() === "LONG_ISLAND_TEA"
      );
    }

    if (filteredDrinks.length === 0) {
      throw new NotFoundError("No drinks found for the specified category.");
    }

    handlerOk(
      res,
      200,
      filteredDrinks,
      "Recommended drinks found successfully"
    );
  } catch (error) {
    next(error);
  }
};

const getSingleRecommendedDrink = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    const { id } = req.user;
    //find drink

    const findDrink = await prisma.recommendeddrink.findFirst({
      where: {
        id: drinkId,
        userId: id,
      },
    });

    if (!findDrink) {
      throw new NotFoundError("Recommend Drink Not Found");
    }

    handlerOk(res, 200, findDrink, "Recommend Drink Found Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteRecommendedDrink = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    const { id } = req.user;
    const findMyDrink = await prisma.recommendeddrink.findFirst({
      where: {
        id: drinkId,
        userId: id,
      },
    });

    if (!findMyDrink) {
      throw new NotFoundError("Recommended Drink Not Found");
    }

    await prisma.recommendeddrink.delete({
      where: {
        id: findMyDrink.id,
      },
    });

    handlerOk(res, 200, null, "Recommended drink delete successfully");
  } catch (error) {
    next(error);
  }
};
module.exports = {
  generateRecommendDrink,
  getRecommendDrink,
  getSingleRecommendedDrink,
  deleteRecommendedDrink,
};
