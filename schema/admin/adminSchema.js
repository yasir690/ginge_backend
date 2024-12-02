const Joi = require("joi");

const adminLoginSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().required(),
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
    deviceToken: Joi.string().allow("").optional(), // Allow empty strings and make it optional
  }),
});


const getAppInfoSchema = Joi.object({
  query: Joi.object({
    detail: Joi.string().valid("termsAndCondition", "privacyPolicy", "aboutApp").required(),
  }),
  params: Joi.object({}),
  body: Joi.object({}),
});

const updateAppInfoSchema = Joi.object({
  query: Joi.object({
    detail: Joi.string().valid("termsAndCondition", "privacyPolicy", "aboutApp").required(),
  }),
  params: Joi.object({}),
  body: Joi.object({
    content: Joi.string().required(),
  }),
});

// const createTermsConditionSchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({}),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });
// const updateTermsConditionSchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({
//     termsId: Joi.string().required(),
//   }),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });

// const createPrivacyPolicySchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({}),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });
// const updatePrivacyPolicySchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({
//     privacyId: Joi.string().required(),
//   }),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });

// const createAboutAppSchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({}),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });
// const updateAboutAppSchema = Joi.object({
//   query: Joi.object({}),
//   params: Joi.object({
//     aboutId: Joi.string().required(),
//   }),
//   body: Joi.object({
//     text: Joi.string().required(),
//   }),
// });

const verifyOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().max(100).required(),
    otp: Joi.string().required()
  }),
});

const resendOtpSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().max(100).required(),
  }),
});

const logoutSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    refresh_token: Joi.string().required(),
  }),
});

const changePasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    password: Joi.string().min(8).max(20).required(),
    old_password: Joi.string().min(8).max(20).required(),
    confirm_password: Joi.string().min(8).max(20).required(),
  }),
});

const forgetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    email: Joi.string().email().max(100).required(),
  }),
});

const resetPasswordSchema = Joi.object({
  query: Joi.object({}),
  params: Joi.object({}),
  body: Joi.object({
    password: Joi.string().min(8).max(20).required(),
    confirm_password: Joi.string().min(8).max(20).required(),
  }),
});
const analyticsSchema = Joi.object({
  query: Joi.object({
    type: Joi.string().valid("year", "month", "week").required(),
  }),
  params: Joi.object({}),
  body: Joi.object({}),
});

module.exports = {
  adminLoginSchema,
  getAppInfoSchema,
  updateAppInfoSchema,
  verifyOtpSchema,
  logoutSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  resendOtpSchema,
  resetPasswordSchema,
  analyticsSchema
  // createTermsConditionSchema,
  // updateTermsConditionSchema,
  // createPrivacyPolicySchema,
  // updatePrivacyPolicySchema,
  // createAboutAppSchema,
  // updateAboutAppSchema,
};
