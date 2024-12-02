const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const InHouseBarController = require("../../controllers/user/InHouseBarController");
const {
  inHouseDrinkSchema,
  deleteInHouseDrinksSchema,
  SingleInHouseDrinkSchema,
} = require("../../schema/inhousedrink/inHouseDrinkSchema");
const { verifyUserToken } = require("../../middleware/auth");

const inHouseDrinkRouter = require("express").Router();

inHouseDrinkRouter.post(
  "/generateInHouseDrink",

  // limiter,
  verifyUserToken,
  validateRequest(inHouseDrinkSchema),
  InHouseBarController.generateInHouseDrink
);

inHouseDrinkRouter.get(
  "/InHouseDrink",

  // limiter,
  verifyUserToken,

  InHouseBarController.getInHouseDrinks
);

inHouseDrinkRouter.get(
  "/SingleInHouseDrink/:drinkId",
  // limiter,
  verifyUserToken,
  validateRequest(SingleInHouseDrinkSchema),
  InHouseBarController.getSingleInHouseDrinks
);

// inHouseDrinkRouter.delete(
//   "/deleteInHouseDrink/:drinkId",
//   limiter,
//   verifyUserToken,
//   validateRequest(deleteInHouseDrinksSchema),
//   InHouseBarController.deleteSingleInHouseDrinks
// );

module.exports = inHouseDrinkRouter;
