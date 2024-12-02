const Joi = require("joi");

const inHouseDrinkSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    drink: Joi.array().items(Joi.string()).required(),
    ingredient: Joi.array().items(Joi.string()).required(),
  }),
});

const SingleInHouseDrinkSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
});

const deleteInHouseDrinksSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  inHouseDrinkSchema,
  SingleInHouseDrinkSchema,
  deleteInHouseDrinksSchema,
};
