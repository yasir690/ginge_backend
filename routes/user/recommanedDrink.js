const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const { verifyUserToken } = require("../../middleware/auth");
const recommendedDrinkController = require("../../controllers/user/recommandedController");
const {
  SingleRecommendedDrinkSchema,
  deleteRecommendedDrinkSchema,
  recommendedDrinkSchema,
} = require("../../schema/recommendeddrink/recommendeddrinkSchema");

const recommendedDrinkRouter = require("express").Router();

recommendedDrinkRouter.post(
  "/drinkInTown",
  limiter,
  verifyUserToken,
  recommendedDrinkController.generateRecommendDrink
);

recommendedDrinkRouter.get(
  "/getRecommendDrink",
  limiter,
  verifyUserToken,
  validateRequest(recommendedDrinkSchema),
  recommendedDrinkController.getRecommendDrink
);

recommendedDrinkRouter.get(
  "/getSingleRecommendedDrink/:drinkId",
  limiter,
  verifyUserToken,
  validateRequest(SingleRecommendedDrinkSchema),
  recommendedDrinkController.getSingleRecommendedDrink
);

recommendedDrinkRouter.delete(
  "/deleteRecommendedDrink/:drinkId",
  limiter,
  verifyUserToken,
  validateRequest(deleteRecommendedDrinkSchema),
  recommendedDrinkController.deleteRecommendedDrink
);

module.exports = recommendedDrinkRouter;
