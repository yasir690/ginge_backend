const express = require("express");
const adminContentRouter = express.Router();
const adminContentController = require("../../controllers/admin/adminContentController");
const { verifyAdminToken } = require("../../middleware/auth");
const limiter = require("../../middleware/limiter");
const {
  // createTermsConditionSchema,
  // updateTermsConditionSchema,
  // createPrivacyPolicySchema,
  // updatePrivacyPolicySchema,
  // createAboutAppSchema,
  // updateAboutAppSchema,
  getAppInfoSchema,
  updateAppInfoSchema
} = require("../../schema/admin/adminSchema");
const validateRequest = require("../../middleware/validateRequest");

adminContentRouter.get(
  "/userFeedBack",

  limiter,
  verifyAdminToken,
  adminContentController.userFeedBack
);

adminContentRouter.get(
  "/get-AppInfo",

  limiter,
  verifyAdminToken,
  validateRequest(getAppInfoSchema),
  adminContentController.getAppInfo
);

adminContentRouter.patch(
  "/update-AppInfo",

  limiter,
  verifyAdminToken,
  validateRequest(updateAppInfoSchema),
  adminContentController.updateAppInfo
);

// adminContentRouter.post(
//   "/createTermsCondition",

//   limiter,
//   verifyAdminToken,
//   validateRequest(createTermsConditionSchema),
//   adminContentController.createTermsCondition
// );

// adminContentRouter.get(
//   "/getTermsCondition",

//   limiter,
//   verifyAdminToken,
//   adminContentController.getTermsCondition
// );

// adminContentRouter.put(
//   "/updateTermsCondition/:termsId",

//   limiter,
//   verifyAdminToken,
//   validateRequest(updateTermsConditionSchema),
//   adminContentController.updateTermsCondition
// );

// adminContentRouter.post(
//   "/createPrivacyPolicy",
//   limiter,
//   verifyAdminToken,
//   validateRequest(createPrivacyPolicySchema),
//   adminContentController.createPrivacyPolicy
// );

// adminContentRouter.get(
//   "/getPrivacyPolicy",
//   limiter,
//   verifyAdminToken,
//   adminContentController.getPrivacyPolicy
// );

// adminContentRouter.put(
//   "/updatePrivacyPolicy/:privacyId",

//   limiter,
//   verifyAdminToken,
//   validateRequest(updatePrivacyPolicySchema),
//   adminContentController.updatePrivacyPolicy
// );

// adminContentRouter.post(
//   "/createAboutApp",

//   limiter,
//   verifyAdminToken,
//   validateRequest(createAboutAppSchema),
//   adminContentController.createAboutApp
// );

// adminContentRouter.get(
//   "/getAboutApp",

//   limiter,
//   verifyAdminToken,
//   adminContentController.getAboutApp
// );

// adminContentRouter.put(
//   "/updateAboutApp/:aboutId",

//   limiter,
//   verifyAdminToken,
//   validateRequest(updateAboutAppSchema),
//   adminContentController.updateAboutApp
// );

module.exports = adminContentRouter;
