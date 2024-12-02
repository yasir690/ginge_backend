const Joi = require("joi");

const userRegisterSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
    // password: Joi.string()
    //   .min(8)
    //   .max(100)
    //   .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    //   .required()
    //   .messages({
    //     "string.min": "Password must be at least 8 characters long",
    //     "string.pattern.base":
    //       "Password must contain at least one special character",
    //   }),
    // confirmPassword: Joi.string()
    //   .valid(Joi.ref("password"))
    //   .required()
    //   .messages({
    //     "any.only": "Password and Confirm Password must match",
    //   }),
  }),
});

const userLoginSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
    // password: Joi.string()
    //   .min(8)
    //   .max(100)
    //   .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    //   .required()
    //   .messages({
    //     "string.min": "Password must be at least 8 characters long",
    //     "string.pattern.base":
    //       "Password must contain at least one special character",
    //   }),
    password: Joi.string().required(),
  }),
});

const userCreateProfileSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().required(),
    gender: Joi.string().valid("MALE", "FEMALE", "NOT PREFER").required(),
    dateOfBirth: Joi.date(),
    country: Joi.string().allow(""),
    city: Joi.string().allow(""),
    states: Joi.string().allow(""),
    latitude: Joi.number()
      .required()
      .greater(-90) // Latitude must be greater than -90
      .less(90) // Latitude must be less than 90
      .precision(6),
    longitude: Joi.number()
      .required()
      .greater(-180) // Longitude must be greater than -180
      .less(180) // Longitude must be less than 180
      .precision(6),
    phoneNumber: Joi.string().required(),
    location: Joi.string().required(),
    about: Joi.string().required()
    // image:Joi.string().required()
  }),
});

const userEditProfileSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email(),
    fullName: Joi.string(),
    gender: Joi.string().valid("MALE", "FEMALE", "NOT PREFER"),
    dateOfBirth: Joi.date(),
    country: Joi.string().allow(""),
    city: Joi.string().allow(""),
    states: Joi.string().allow(""),
    latitude: Joi.number()
      .greater(-90) // Latitude must be greater than -90
      .less(90) // Latitude must be less than 90
      .precision(6),
    longitude: Joi.number()
      .greater(-180) // Longitude must be greater than -180
      .less(180) // Longitude must be less than 180
      .precision(6),
    phoneNumber: Joi.string(),
    location: Joi.string().required(),
    about: Joi.string().required()
    // image:Joi.string().required()
  }),
});

const forgetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
});

const resetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one special character",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Password and Confirm Password must match",
      }),
  }),
});

const verifyOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
    deviceType: Joi.string().valid("ANDROID", "IOS"),
    userType: Joi.string().valid("ADMIN", "USER"),
    deviceToken: Joi.string(),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .optional()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one special character",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .optional()
      .messages({
        "any.only": "Password and Confirm Password must match",
      }),
    otpReason: Joi.string().valid("REGISTER", "FORGETPASSWORD").required(),
  }),
});

const feedBackSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    subject: Joi.string().required(),
    description: Joi.string().required(),
  }),
});

const changePasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    existingPassword: Joi.string()
      .min(8)
      .max(100)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one special character",
      }),
    newPassword: Joi.string()
      .min(8)
      .max(100)
      .pattern(new RegExp("(?=.*[!@#$%^&*])"))
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.pattern.base":
          "Password must contain at least one special character",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "newPassword and Confirm Password must match",
      }),
  }),
});

module.exports = {
  userRegisterSchema,
  userLoginSchema,
  userCreateProfileSchema,
  userEditProfileSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
  feedBackSchema,
  changePasswordSchema,
};
