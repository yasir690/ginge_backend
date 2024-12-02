// const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const preferredController = require("../../controllers/user/preferredDrinkController");
const { verifyUserToken } = require("../../middleware/auth");

const preferredDrinkRouter = require("express").Router();

preferredDrinkRouter.get(
  "/drinks",
  verifyUserToken,
  preferredController.getPreferredDrinks
);
preferredDrinkRouter.get(
  "/drink/:drinkId",
  verifyUserToken,
  preferredController.singleDrink
);
preferredDrinkRouter.get(
  "/drink-categories",
  verifyUserToken,
  preferredController.getAllCategories
);
preferredDrinkRouter.get(
  "/category-drink",
  verifyUserToken,
  preferredController.getDrinkByCategory
);
module.exports = preferredDrinkRouter;
