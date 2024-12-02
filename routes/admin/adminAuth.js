const express = require("express");
const adminAuthRouter = express.Router();
const adminAuthController = require("../../controllers/admin/adminAuthController");
const limiter = require("../../middleware/limiter");
const { verifyAdminToken } = require("../../middleware/auth");
const { 
  adminLoginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  logoutSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  analyticsSchema
} = require("../../schema/admin/adminSchema");
const validateRequest = require("../../middleware/validateRequest");

adminAuthRouter.post(
  "/adminRegister",

  limiter,
  adminAuthController.adminRegister
);

adminAuthRouter.post(
  "/adminLogin",

  limiter,
  validateRequest(adminLoginSchema),
  adminAuthController.adminLogin
);

adminAuthRouter.patch(
  "/change-password",
  verifyAdminToken,
  validateRequest(changePasswordSchema),
  adminAuthController.changePassword
);
adminAuthRouter.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  adminAuthController.forgetPassword
);
adminAuthRouter.patch(
  "/reset-password",
  verifyAdminToken,
  validateRequest(resetPasswordSchema),
  adminAuthController.resetPassword
);
adminAuthRouter.post(
  "/verify-otp",
  validateRequest(verifyOtpSchema),
  adminAuthController.verifyOTP
);
adminAuthRouter.post(
  "/resend-otp",
  validateRequest(resendOtpSchema),
  adminAuthController.resendOTP
);
adminAuthRouter.get(
  "/get-user-list",
  verifyAdminToken,
  adminAuthController.appUsersList
);

adminAuthRouter.post(
  "/logout",
  verifyAdminToken,
  adminAuthController.logout
);

adminAuthRouter.get(
  "/analytics",
  verifyAdminToken,
  validateRequest(analyticsSchema),
  adminAuthController.userAnalytics
);

module.exports = adminAuthRouter;
