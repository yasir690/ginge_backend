const Joi = require("joi");

const myDrinkSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
  body: Joi.object({
    // title: Joi.string().required(),
    // procedure: Joi.array().items(Joi.string().min(1)).min(1).required(),
    // ingredient: Joi.array().items(Joi.string().min(1)).min(1).required(),
    // img: Joi.string().required(),
  }),
});

const deleteMyDrinkSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
  body: Joi.object({}),
});

module.exports = {
  myDrinkSchema,
  deleteMyDrinkSchema,
};
