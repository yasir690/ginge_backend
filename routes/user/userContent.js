const limiter = require("../../middleware/limiter");
const userContentRouter = require("express").Router();
const userContentController = require("../../controllers/user/userContentController");
const { verifyUserToken } = require("../../middleware/auth");

userContentRouter.get(
  "/getUserPrivacyPolicy",
  // limiter,
  verifyUserToken,
  userContentController.getUserPrivacyPolicy
);

userContentRouter.get(
  "/getUserTermsCondition",
  // limiter,
  verifyUserToken,
  userContentController.getUserTermsCondition
);

userContentRouter.get(
  "/getUserAboutApp",
  // limiter,
  verifyUserToken,
  userContentController.getUserAboutApp
);

module.exports = userContentRouter;
