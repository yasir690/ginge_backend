const limiter = require("../../middleware/limiter");
const validateRequest = require("../../middleware/validateRequest");

const userNotificationRouter = require("express").Router();
const userNotificationController = require("../../controllers/user/userNotificationController");
const { verifyUserToken } = require("../../middleware/auth");
const {
  readNotificationSchema,
} = require("../../schema/notification/notificationSchema");

// userNotificationRouter.post(
//   "/create",
//   // limiter,
//   verifyUserToken,
//   userNotificationController.createNotification
// );

userNotificationRouter.get(
  "/getAllNotification",
  // limiter,
  verifyUserToken,
  userNotificationController.getAllNotification
);

userNotificationRouter.put(
  "/readNotification",
  // limiter,
  verifyUserToken,
  validateRequest(readNotificationSchema),
  userNotificationController.readNotifications
);

// userNotificationRouter.get(
//   "/notificationOnAndOff",
//   limiter,
//   verifyUserToken,
//   userNotificationController.notificationOnAndOff
// );

module.exports = userNotificationRouter;
