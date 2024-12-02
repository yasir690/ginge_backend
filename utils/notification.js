const { appInstance } = require("../config/firebase/firebase.config");
const prisma = require("../config/prismaConfig");

const sendNotifications = async (notificationData, notificationContent) => {
  try {
    const { fcmToken, isNotify, userId } = notificationData;
    const { title, body } = notificationContent;

    if (fcmToken && isNotify) {
      console.log("here")
      const newNotification = await prisma.notification.create({
        data: {
          title,
          body,
          userId
        },
      });
      const notification = {
        notification: {
          title,
          body: body,
        },
        token: fcmToken,
      };
      await appInstance.messaging().send(notification);
      return newNotification;
    } else {
      console.log("else here")

      const newNotification = await prisma.notification.create({
        data: {
          title,
          body,
          userId
        },
      });
      console.log("User has disabled notifications");
      return newNotification;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendNotifications,
};