const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");

const userIngredientRouter = require("express").Router();
const userIngredientController = require("../../controllers/user/userIngredientController");
const { verifyUserToken } = require("../../middleware/auth");
const {
  addIngredientSchema,
  deleteIngredientSchema,
} = require("../../schema/ingredient/ingredientSchema");

userIngredientRouter.post(
  "/addIngredient",
  // limiter,
  verifyUserToken,
  validateRequest(addIngredientSchema),
  userIngredientController.addIngredient
);

userIngredientRouter.get(
  "/getIngredients",
  // limiter,
  verifyUserToken,
  userIngredientController.getIngredients
);

userIngredientRouter.delete(
  "/deleteIngredient/:ingredientId",
  // limiter,
  verifyUserToken,
  validateRequest(deleteIngredientSchema),
  userIngredientController.deleteIngredient
);

module.exports = userIngredientRouter;
