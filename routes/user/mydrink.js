const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const myDrinkController = require("../../controllers/user/myDrinkController");
const { verifyUserToken } = require("../../middleware/auth");
const {
  myDrinkSchema,
  deleteMyDrinkSchema,
} = require("../../schema/mydrink/myDrinkSchema");

const myDrinkRouter = require("express").Router();

myDrinkRouter.post(
  "/saveMyDrink/:drinkId",
  // limiter,
  verifyUserToken,
  validateRequest(myDrinkSchema),
  myDrinkController.saveMyDrink
);

myDrinkRouter.get(
  "/getMyDrinks",
  // limiter,
  verifyUserToken,
  myDrinkController.getMyDrinks
);

myDrinkRouter.delete(
  "/deleteMyDrink/:drinkId",
  // limiter,
  verifyUserToken,
  validateRequest(deleteMyDrinkSchema),
  myDrinkController.deleteMyDrink
);

myDrinkRouter.get(
  "/getMyDrink/:drinkId",
  // limiter,
  verifyUserToken,
  validateRequest(deleteMyDrinkSchema),
  myDrinkController.getMyDrink
);
module.exports = myDrinkRouter;
