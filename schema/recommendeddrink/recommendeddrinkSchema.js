const Joi = require("joi");

const recommendedDrinkSchema = Joi.object({
  query: Joi.object({
    popular: Joi.string().optional(),
    mojito: Joi.string().optional(),
    oldfashion: Joi.string().optional(),
    longislandtea: Joi.string().optional(),
  }),
  params: Joi.object({}),
  body: Joi.object({}),
});

const SingleRecommendedDrinkSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
});

const deleteRecommendedDrinkSchema = Joi.object({
  query: Joi.object({}),
  body: Joi.object({}),
  params: Joi.object({
    drinkId: Joi.string().required(),
  }),
});

module.exports = {
  recommendedDrinkSchema,
  SingleRecommendedDrinkSchema,
  deleteRecommendedDrinkSchema,
};
