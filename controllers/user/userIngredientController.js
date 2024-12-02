const prisma = require("../../config/prismaConfig");
const { NotFoundError, ConflictError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { v4: uuidv4 } = require("uuid"); // Import UUID
const addIngredient = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { ingredientName } = req.body;

    const findBar = await prisma.bar.findFirst({
      where: {
        userId: id,
      },
    });

    if (!findBar) {
      throw new NotFoundError("Bar Not Found");
    }

    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        barId: findBar.id,
        ingredientName: ingredientName,
      },
    });

    if (existingIngredient) {
      throw new ConflictError("Ingredient Already Added");
    }

    // Generate a new UUID for the mydrink entry
    // const newDrinkId = uuidv4();
    const saveIngredient = await prisma.ingredient.create({
      data: {
        // id: newDrinkId,
        ingredientName,
        barId: findBar.id,
      },
    });

    handlerOk(res, 201, saveIngredient, "Ingredient Added Successfully");
  } catch (error) {
    next(error);
  }
};

const getIngredients = async (req, res, next) => {
  try {
    const { id } = req.user;

    const foundIngredients = await prisma.bar.findMany({
      where: {
        userId: id,
      },
      include: {
        ingredient: true,
      },
    });

    if (foundIngredients.length === 0) {
      throw new NotFoundError("Ingredients Not Found");
    }

    handlerOk(res, 200, foundIngredients, "Ingredient Found Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;

    const findIngredient = await prisma.ingredient.findFirst({
      where: {
        id: ingredientId,
      },
    });

    if (!findIngredient) {
      throw new NotFoundError("Ingredient Not Found");
    }

    await prisma.ingredient.delete({
      where: {
        id: findIngredient.id,
      },
    });

    handlerOk(res, 200, null, "Ingredient Delete Successfully");
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addIngredient,
  getIngredients,
  deleteIngredient,
};
