const prisma = require("../../config/prismaConfig");
const { NotFoundError, ConflictError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { v4: uuidv4 } = require("uuid"); // Import UUID

const addDrink = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { drinkName } = req.body;

    const findBar = await prisma.bar.findFirst({
      where: {
        userId: id,
      },
    });

    if (!findBar) {
      throw new NotFoundError("Bar Not Found");
    }

    const existingDrink = await prisma.drink.findFirst({
      where: {
        barId: findBar.id,
        drinkName: drinkName,
      },
    });

    if (existingDrink) {
      throw new ConflictError("Drink Already Added");
    }

    const saveDrink = await prisma.drink.create({
      data: {
        drinkName,
        barId: findBar.id,
      },
    });

    handlerOk(res, 201, saveDrink, "drink Added Successfully");
  } catch (error) {
    next(error);
  }
};

const getDrinks = async (req, res, next) => {
  try {
    const { id } = req.user;

    const getAllDrinks = await prisma.bar.findMany({
      where: {
        userId: id,
      },
      include: {
        drink: true,
      },
    });

    if (getAllDrinks.length === 0) {
      throw new NotFoundError("Drinks Not Found");
    }

    handlerOk(res, 200, getAllDrinks, "Drinks Found Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteDrink = async (req, res, next) => {
  try {
    const { drinkId } = req.params;

    const findDrink = await prisma.drink.findFirst({
      where: {
        id: drinkId,
      },
    });

    if (!findDrink) {
      throw new NotFoundError("Drink Not Found");
    }

    await prisma.drink.delete({
      where: {
        id: findDrink.id,
      },
    });

    handlerOk(res, 200, null, "Drink Delete Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDrink,
  getDrinks,
  deleteDrink,
};
