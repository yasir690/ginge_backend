// const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const recommendedController = require("../../controllers/user/recommendationDrinkControllr");
const { verifyUserToken } = require("../../middleware/auth");

const recommendedDrinkRouter = require("express").Router();

recommendedDrinkRouter.get(
    "/drinks",
    verifyUserToken,
    recommendedController.getRecommendationDrinks
);
recommendedDrinkRouter.get(
    "/drink/:drinkId",
    verifyUserToken,
    recommendedController.singleDrink
);
recommendedDrinkRouter.get(
    "/drink-categories",
    verifyUserToken,
    recommendedController.getAllCategories
);
module.exports = recommendedDrinkRouter;
