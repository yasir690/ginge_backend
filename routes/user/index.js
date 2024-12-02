const userRouter = require("express").Router();

const userAuthRouter = require("./userAuth");
const userDrinkRouter = require("./userDrink");
const userIngredientRouter = require("./userIngredient");
const userContentRouter = require("./userContent");
const userNotificationRouter = require("./userNotification");
const inHouseDrinkRouter = require("./inhousedrink");
// const recommendedDrinkRouter = require("./recommanedDrink");
const recommendedDrinkRouter = require("./recommendedDrink");
const preferredDrinkRouter = require("./preferredDrink");
const myDrinkRouter = require("./mydrink");
const BotRouter = require("./bot")
userRouter.use("/auth", userAuthRouter);
userRouter.use("/drink", userDrinkRouter);
userRouter.use("/ingredient", userIngredientRouter);
userRouter.use("/content", userContentRouter);
userRouter.use("/notification", userNotificationRouter);
userRouter.use("/inhousedrink", inHouseDrinkRouter);
userRouter.use("/recommendeddrink", recommendedDrinkRouter);
userRouter.use("/preferreddrink", preferredDrinkRouter);
userRouter.use("/mydrink", myDrinkRouter);
userRouter.use("/bot", BotRouter)
module.exports = userRouter;
