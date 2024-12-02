const validateRequest = require("../../middleware/validateRequest");
const BotController = require("../../controllers/user/botController");
const { verifyUserToken } = require("../../middleware/auth");
const BotRouter = require("express").Router();

BotRouter.get(
    "/generate-question",
    verifyUserToken,
    BotController.questionGeneration
);

BotRouter.get(
    "/generate-response",
    verifyUserToken,
    BotController.responseGeneration
);

module.exports = BotRouter;
