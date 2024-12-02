const prisma = require("../../config/prismaConfig");
const { userConstants } = require("../../constants/constants");
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const {genToken} = require("../../utils/generateToken");
const { hashPassword, comparePassword } = require("../../utils/passwordHashed");
const { generateOtp, resetOtp } = require("../../utils/generateOtp");
const sendEmails = require("../../utils/sendEmail");
const emailTemplates = require("../../utils/emailTemplate");
const {getWeekNumber, getDayName} = require("../../utils/user-analytics-helper")


const adminRegister = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const findAdmin = await prisma.admin.findFirst({
      where: {
        email: email,
      },
    });
    if (findAdmin) {
      throw new ConflictError("admin already exist");
    }

    const hashPass = await hashPassword(password);
    const saveAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashPass,
        userType: userConstants.ADMIN,
      },
    });
    // Generate the token with an object as payload
    const token = await genToken({
      id: saveAdmin.id,
      userType: userConstants.ADMIN,
    });
    const response = {
      adminToken: token,
    };

    handlerOk(res, 200, response, "Admin Register Successfully");
  } catch (error) {
    next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password, deviceToken } = req.body;

    const findadmin = await prisma.admin.findFirst({
      where: {
        email: email,
      },
    });

    if (!findadmin) {
      throw new NotFoundError("Admin Not Found");
    }

    const comparePass = await comparePassword(password, findadmin.password);

    if (!comparePass) {
      throw new BadRequestError("Please Enter Correct Password");
    }
    // Generate the token with an object as payload
    const token = await genToken({
      id: findadmin.id,
      userType: userConstants.ADMIN,
    });

    const response = {
      adminToken: token,
    };
    if (deviceToken) {
      response.deviceToken = deviceToken;
      await prisma.admin.update({
        where: {
          id: findadmin.id,
        },
        data: {
          deviceToken: deviceToken,
        },
      });
    }

    handlerOk(res, 200, response, "Admin Login Successfully");
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const admin = req.user;
  const { password, old_password, confirm_password } = req.body;
  try {
    if (password !== confirm_password) {
      throw new BadRequestError(
        "Confirm password is not same as new passoword"
      );
    }
    const match = await comparePassword(old_password, admin.password);
    if (!match) {
      throw new BadRequestError(
        "Confirm password is not same as new passoword"
      );
    }
    const hashedPassword = await hashPassword(password);
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    handlerOk(res, 200, null, "Admin password changed successfully.");
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    let admin = await prisma.admin.findFirst({
      where: {
        email,
      },
    });
    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    const otp = generateOtp();
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        otp,
      },
    });
    const emailData = {
      subject: "Ginge - Account Verification",
      html: emailTemplates.forgetPassword(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);
    await resetOtp("admin", admin.id); //expire OTP after 60seconds

    handlerOk(res, 200, { otp }, "OTP sent successfully. Please verify OTP");
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const admin = req.user;
  const { password, confirm_password } = req.body;

  try {
    if (password !== confirm_password) {
      throw new BadRequestError(
        "Confirm password is not same as new passoword"
      );
    }
    const findUser = await prisma.admin.findFirst({
      where: {
        id: admin.id,
      },
    });
    if (!findUser) {
      throw new NotFoundError("Admin not found");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        password: hashedPassword,
        otp: "",
      },
    });

    handlerOk(res, 200, null, "Admin password reset successfully.");
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        email,
      },
    });
    if (!admin) {
      throw new BadRequestError("Invalid credentials. - Wrong admin email");
    }
    if (admin.otp == otp) {
      await prisma.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          otp: "",
        },
      });
    } else {
      throw new BadRequestError("Invalid or Expired OTP.");
    }

    // Generate the token with an object as payload
    const token = await genToken({
      id: admin.id,
      userType: userConstants.ADMIN,
    });

    const response = {
      adminToken: token,
    };

    handlerOk(res, 200, response, "Admin OTP Verified");

  } catch (error) {
    next(error)
  }
};

const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        email,
      },
    });
    if (!admin) {
      throw new BadRequestError("Admin not Found.");
    }
    const otp = generateOtp();
    await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        otp,
      },
    });
    const emailData = {
      subject: "Ginge - Account Verification",
      html: emailTemplates.resendOTP(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);
    await resetOtp("admin", admin.id); //expire OTP after 60seconds

    handlerOk(res, 200, response, "OTP sent successfully. Please verify OTP");

  } catch (error) {
    next(error)
  }
};

const appUsersList = async(req, res, next) => {
  try {

    let totalUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        gender: true,
        dateOfBirth: true,
        country: true,
        city: true,
        states: true,
        phoneNumber: true,
        deviceType: true,
        image: true,
        location: true,
        createdAt: true
      }
    })

    handlerOk(res, 200, totalUsers, "Fetched All Users Successfully");

  } catch (error) {
    next(error);
  }
}

const logout = async(req, res,next) => {
  const admin = req.user;
  try {
    await prisma.admin.update({
      where: {
        id: admin?.id,
      },
      data: {
        fcmToken: "",
      },
    });

    handlerOk(res, 200, response, "User Logout Successfully!");

  } catch (error) {
    next(error);
  }
}

const userAnalytics = async(req, res) => {
  try {
    let { type } = req.query;
    type = type.toLowerCase();

    let userdata;
    if (type === "year") {
      const year = new Date().getFullYear();
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);
      const allUsers = await prisma.user.findMany({
        where: {
          isCreatedProfile: true,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      });
      userdata = await yearlyGrowth(allUsers);
    } else if (type === "month") {
      let particularMonth = new Date().getMonth() + 1;
      let particularYear = new Date().getFullYear();
      if (particularMonth < 10) {
        particularMonth = `0${particularMonth}`;
      }
      const startDate = new Date(
        `${particularYear}-${particularMonth}-01T00:00:00.000Z`
      );
      const endDate = new Date(
        `${particularYear}-${particularMonth}-31T00:00:00.000Z`
      );

      const allUsers = await prisma.user.findMany({
        where: {
          isCreatedProfile: true,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      userdata = await monthlyGrowth(
        allUsers,
        particularMonth,
        particularYear
      );
    } else if (type === "week") {
      const today = new Date();
      const past7Days = new Date();
      past7Days.setDate(today.getDate() - 7);

      const allUsers = await prisma.user.findMany({
        where: {
          isCreatedProfile: true,
          createdAt: {
            gte: past7Days,
            lt: today,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      userdata = await WeeklyGrowth(today, allUsers);
    }

    handlerOk(res, 200, userdata, "Successfully fetched user analytics.");

  } catch (error) {
    const response = serverErrorResponse(error.message);
    return res.status(response.status.code).json(response);
  }
}

const yearlyGrowth = async(allUsers) =>{
  try {
    const yearlyGoals = allUsers.reduce((acc, user) => {
      const month = user.createdAt.getMonth() + 1;
      if (!acc[month]) {
        acc[month] = {
          count: 0,
        };
      }
      acc[month].count++;
      return acc;
    }, {});

    // const total = allUsers.length;
    const processedData = {};
    for (const key in yearlyGoals) {
      const { count } = yearlyGoals[key];
      // const percentage = total > 0 ? (count / total) * 100 : 0;
      processedData[key] = {
        x: parseInt(key),
        y: parseFloat(count),
      };
    }

    for (let i = 1; i <= 12; i++) {
      if (processedData[i]) {
        continue;
      } else {
        processedData[i] = {
          x: i,
          y: 0,
        };
      }
    }
    const outputArray = Object.values(processedData);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    for (const output of outputArray) {
      output.x = monthNames[output.x - 1];
    }
    return outputArray;
  } catch (error) {
    return [];
  }
}

const monthlyGrowth = async(allUsers, particularMonth, particularYear) => {
  try {
    const monthlyGoals = allUsers.reduce((acc, user) => {
      const week = getWeekNumber(user.createdAt);

      if (!acc[week]) {
        acc[week] = {
          count: 0,
        };
      }

      acc[week].count++;

      return acc;
    }, {});

    // const total = allUsers.length;
    const processedData = {};
    for (const key in monthlyGoals) {
      const { count } = monthlyGoals[key];
      // const percentage = total > 0 ? (count / total) * 100 : 0;
      processedData[key] = {
        x: parseInt(key),
        y: parseFloat(count),
      };
    }

    function getWeekNumbers(month, year) {
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      const weekNumbers = [];

      for (
        let day = firstDayOfMonth.getDate();
        day <= lastDayOfMonth.getDate();
        day++
      ) {
        const date = new Date(year, month - 1, day);
        const weekNumber = getWeekNumber(date);
        if (!weekNumbers.includes(weekNumber)) {
          weekNumbers.push(weekNumber);
        }
      }

      return weekNumbers;
    }

    const weekNumbers = getWeekNumbers(particularMonth, particularYear);
    if (weekNumbers.length > 5) {
      weekNumbers.pop();
    }

    for (
      let i = weekNumbers[0];
      i <= weekNumbers[weekNumbers.length - 1];
      i++
    ) {
      if (!processedData[i]) {
        processedData[i] = {
          x: i,
          y: 0,
        };
      }
    }
    const outputArray = Object.values(processedData);

    let index = 1;
    for (const output of outputArray) {
      output.x = "Week " + index;
      index++;
    }

    return outputArray;
  } catch (error) {
    return [];
  }
}

const WeeklyGrowth = async(today, allUsers) => {
  try {
    const weeklyGoals = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const day = date.getDate();
      const formattedDay = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      weeklyGoals[formattedDay] = {
        day: getDayName(formattedDay),
        count: 0,
      };
    }

    allUsers.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split("T")[0];
      if (weeklyGoals[dateKey]) {
        weeklyGoals[dateKey].count++;
      }
    });

    // const totalUsers = allUsers.length;
    const processedData = Object.entries(weeklyGoals).map(
      ([key, { count, day }]) => {
        // const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;
        return { x: day, y: parseFloat(count) };
      }
    );

    let outputArray = Object.values(processedData);
    outputArray = outputArray.reverse();
    return outputArray;
  } catch (error) {
    console.log("error: ", error);
    return [];
  }
}

module.exports = {
  adminRegister,
  adminLogin,
  changePassword,
  forgetPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  appUsersList,
  logout,
  userAnalytics
};
