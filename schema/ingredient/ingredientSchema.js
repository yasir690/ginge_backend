const Joi = require("joi");

const addIngredientSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    ingredientName: Joi.string().required(),
  }),
});

const deleteIngredientSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    ingredientId: Joi.string().required(),
  }),
});

module.exports = {
  addIngredientSchema,
  deleteIngredientSchema,
};
