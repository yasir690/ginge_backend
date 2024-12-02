const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");

const userDrinkRouter = require("express").Router();
const userDrinkController = require("../../controllers/user/userDrinkController");
const { verifyUserToken } = require("../../middleware/auth");
const {
  addDrinkSchema,
  deleteDrinkSchema,
} = require("../../schema/drink/drinkSchema");

userDrinkRouter.post(
  "/addDrink",
  // limiter,
  verifyUserToken,
  validateRequest(addDrinkSchema),
  userDrinkController.addDrink
);

userDrinkRouter.get(
  "/getDrinks",
  // limiter,
  verifyUserToken,
  userDrinkController.getDrinks
);

userDrinkRouter.delete(
  "/deleteDrink/:drinkId",
  // limiter,
  verifyUserToken,
  validateRequest(deleteDrinkSchema),
  userDrinkController.deleteDrink
);

module.exports = userDrinkRouter;
