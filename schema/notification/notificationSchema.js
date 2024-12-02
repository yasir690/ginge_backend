const Joi = require("joi");

const readNotificationSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = { readNotificationSchema };
