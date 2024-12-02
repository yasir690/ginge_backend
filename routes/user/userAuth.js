const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");
const {
  userRegisterSchema,
  userLoginSchema,
  verifyOtpSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  userCreateProfileSchema,
  userEditProfileSchema,
  feedBackSchema,
  changePasswordSchema,
} = require("../../schema/user/userSchema");

const userAuthRouter = require("express").Router();
const userAuthController = require("../../controllers/user/userAuthController");
const { verifyUserToken } = require("../../middleware/auth");
const handleMultiPartData = require("../../middleware/multiPartData");
const isFileExists = require("../../middleware/isFileExist");
userAuthRouter.post(
  "/userRegister",

  validateRequest(userRegisterSchema),
  userAuthController.userRegister
);

userAuthRouter.post(
  "/userLogin",
  validateRequest(userLoginSchema),
  userAuthController.userLogin
);

userAuthRouter.post(
  "/verifyOtp",
  validateRequest(verifyOtpSchema),
  userAuthController.verifyOtp
);

userAuthRouter.post(
  "/resendOtp",
  validateRequest(userRegisterSchema),
  userAuthController.resentOTP
);

userAuthRouter.post(
  "/forgetPassword",
  validateRequest(forgetPasswordSchema),
  userAuthController.forgetPassword
);

userAuthRouter.post(
  "/resetPassword",
  verifyUserToken,
  validateRequest(resetPasswordSchema),

  userAuthController.resetPassword
);

userAuthRouter.post(
  "/createProfile",
  // verifyUserToken,
  handleMultiPartData.single("image"),
  isFileExists("profile image required"),
  validateRequest(userCreateProfileSchema),
  userAuthController.createProfile
);

userAuthRouter.put(
  "/editProfile",
  verifyUserToken,
  handleMultiPartData.single("image"),
  validateRequest(userEditProfileSchema),
  userAuthController.editProfile
);

userAuthRouter.delete(
  "/deleteAccount",
  verifyUserToken,
  userAuthController.deleteAccount
);

userAuthRouter.post(
  "/submitFeedBack",
  verifyUserToken,
  validateRequest(feedBackSchema),
  userAuthController.userFeedBack
);

userAuthRouter.put(
  "/changePassword",
  verifyUserToken,
  validateRequest(changePasswordSchema),
  userAuthController.changePassword
);

userAuthRouter.get("/getProfile", verifyUserToken, userAuthController.getProfile)
userAuthRouter.post("/refresh-token", userAuthController.refreshUser);
userAuthRouter.post("/logout", verifyUserToken, userAuthController.logout);
userAuthRouter.patch("/update-notify", verifyUserToken, userAuthController.updateuserNotify);
userAuthRouter.patch("/update-bot", verifyUserToken, userAuthController.updateuserBot);

module.exports = userAuthRouter;
