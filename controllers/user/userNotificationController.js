const prisma = require("../../config/prismaConfig");
const { NotFoundError, ConflictError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const getAllNotification = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findNotification = await prisma.notification.findMany({
      where: {
        userId: id,
      },
    });

    handlerOk(res, 200, findNotification, "Notification Found Successfully");
  } catch (error) {
    next(error);
  }
};


const readNotifications = async (req, res, next) => {
  try {

    const { id } = req.user;

    await prisma.notification.updateMany({
      where: {
        userId: id,
        isRead: false
      },
      data: {
        isRead: true,
      },
    });

    handlerOk(res, 200, null, "Notification Read Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNotification,
  readNotifications
};
