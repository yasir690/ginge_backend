const Joi = require("joi");

const addDrinkSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    drinkName: Joi.string().required(),
  }),
});

const SingleDrinkSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
});

const deleteDrinkSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
});

module.exports = {
  addDrinkSchema,
  SingleDrinkSchema,
  deleteDrinkSchema,
};
