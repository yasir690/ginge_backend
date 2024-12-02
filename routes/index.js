const express = require("express");
const router = express.Router();
const userRouter = require("./user/index");
const adminRouter = require("./admin/index");

router.use("/user", userRouter);
router.use("/admin", adminRouter);

router.all("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "route not found",
  });
});
module.exports = router;
