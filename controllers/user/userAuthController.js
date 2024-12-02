require("dotenv").config();
const prisma = require("../../config/prismaConfig");
const {generateOtp} = require("../../utils/generateOtp");
const { hashPassword, comparePassword } = require("../../utils/passwordHashed");
const {
  ConflictError,
  BadRequestError,
  NotFoundError,
  ForbiddenError
} = require("../../CustomError");
const { otpConstants, userConstants } = require("../../constants/constants");
const { handlerOk } = require("../../resHandler/responseHandler");
const verifyOTP = require("../../utils/verifyOtp");
const {genToken, refreshAccessToken, generateRefreshToken} = require("../../utils/generateToken");
const sendEmails = require("../../utils/sendEmail");
const emailTemplates = require("../../utils/emailTemplate");
const uploadFileWithFolder = require("../../utils/s3Upload");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Import UUID

const userRegister = async (req, res, next) => {
  try {
    const { email } = req.body;

    const finduser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (finduser) {
      throw new ConflictError("user already exist");
    }

    const otp = generateOtp();
    console.log(otp);

    // const newDrinkId = uuidv4();

    // console.log(newDrinkId, "newDrinkId");

    // return "";

    const findotp = await prisma.otp.findFirst({
      where: {
        email: email
      },
    });
    if(findotp){
      await prisma.otp.update({
        where: {
          id: findotp.id,
        },
        data: {
          otpKey: otp,
          otpReason: otpConstants.REGISTER,
          otpUsed: false
        },
      });
    }else{
      const saveOtp = await prisma.otp.create({
        data: {
          // id: newDrinkId,
          email: email,
          otpKey: otp,
          otpReason: otpConstants.REGISTER,
        },
      });  
    }
    const emailData = {
      subject: "Ginge - Account Verification",
      html: emailTemplates.register(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);

    handlerOk(res, 200, otp, "Otp Sent Successfully");
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const {
      email,
      password,
      otp,
      otpReason,
      deviceType,
      deviceToken,
      userType,
    } = req.body;

    if (otpReason === "REGISTER") {
      const findotp = await prisma.otp.findFirst({
        where: {
          email: email
        },
      });

      if (!findotp) {
        throw new BadRequestError("invalid otp");
      }

      if (findotp.otpUsed) {
        throw new ConflictError("otp already used");
      }

      const isOtpValid = verifyOTP(otp, findotp.otpKey, findotp?.updatedAt);

      if (!isOtpValid) {
        throw new BadRequestError("Invalid otp");
      }

      await prisma.otp.update({
        where: {
          id: findotp.id,
        },
        data: {
          otpUsed: true,
          otpReason: otpConstants.REGISTER
        },
      });

      const hashPass = await hashPassword(password);
      // const newDrinkId = uuidv4();
      const saveUser = await prisma.user.create({
        data: {
          // id: newDrinkId,
          email,
          password: hashPass,
          deviceType,
          deviceToken,
          userType: userType,
        },
      });

      // Generate the token with an object as payload
      const token = genToken({ id: saveUser.id, userType: userType });
      const Obj = {
        userToken: token,
      };
      // await prisma.otp.delete({
      //     where:{
      //         id:findotp.id
      //     }
      // });

      handlerOk(
        res,
        201,
        Obj,
        "Otp Verified Successfully,Now Create Your Profile"
      );
    }

    if (otpReason === "FORGETPASSWORD") {
      const finduser = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (!finduser) {
        throw new NotFoundError("user not found");
      }
      const findotp = await prisma.otp.findFirst({
        where: {
          email: email
        },
      });

      if (!findotp) {
        throw new BadRequestError("invalid otp");
      }

      if (findotp.otpUsed) {
        throw new ConflictError("otp already used");
      }

      const isOtpValid = verifyOTP(otp, findotp.otpKey, findotp?.updatedAt);

      if (!isOtpValid) {
        throw new BadRequestError("Invalid otp");
      }

      await prisma.otp.update({
        where: {
          id: findotp.id,
        },
        data: {
          otpUsed: true,
          otpReason: otpConstants.FORGETPASSWORD
        },
      });

      // Generate the token with an object as payload
      const token = genToken({
        id: finduser.id,
        userType: finduser.userType,
      });

      const Obj = {
        userToken: token,
      };

      // await prisma.otp.delete({
      //     where:{
      //         id:findotp.id
      //     }
      // });

      handlerOk(
        res,
        201,
        null,
        "Otp Verified Successfully,Now Set Your Password"
      );
    }
  } catch (error) {
    console.log('error: ', error)
    next(error);
  }
};

const resentOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const findotp = await prisma.otp.findFirst({
      where: {
        email: email
      },
    });

    if (!findotp) {
      throw new NotFoundError("User Not Found");
    }
    const otp = generateOtp();

    await prisma.otp.update({
      where:{
        email: email
      },
      data:{
        otpKey: otp,
        otpUsed: false
      }
    })

    const emailData = {
      subject: "Ginge - Account Verification",
      html: emailTemplates.resendOTP(otp)
    };

    await sendEmails(email, emailData.subject, emailData.html);

    handlerOk(
      res,
      201,
      otp,
      "Otp send Successfully,Now Verify your OTP"
    );
  } catch (error) {
    next(error);
  }
}

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const finduser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!finduser) {
      throw new NotFoundError("User Not Found");
    }

    const comparePass = await comparePassword(password, finduser.password);

    if (!comparePass) {
      throw new BadRequestError("Please Enter Correct Password");
    }
    // Generate the token with an object as payload

    const token = genToken({
      id: finduser.id,
      userType: finduser.userType,
    });

    const refrestToken = generateRefreshToken({
      id: finduser.id,
      userType: finduser.userType 
    })

    const response = {
      isCreatedProfile: finduser.isCreatedProfile,
      userToken: token,
      refreshToken: refrestToken
    };

    handlerOk(res, 200, response, "User Login Successfully");
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const findemail = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!findemail) {
      throw new NotFoundError("User Not Found");
    }

    const otp = generateOtp();
    // const newDrinkId = uuidv4();

    const findotp = await prisma.otp.findFirst({
      where: {
        email: email
      },
    });
    if(findotp){
      await prisma.otp.update({
        where: {
          id: findotp.id
        },
        data: {
          otpKey: otp,
          otpUsed: false,
          otpReason: otpConstants.FORGETPASSWORD,
        },
      });
    }else{
      const saveOtp = await prisma.otp.create({
        data: {
          // id: newDrinkId,
          email: email,
          otpKey: otp,
          otpReason: otpConstants.FORGETPASSWORD,
        },
      });  
    }

    const emailData = {
      subject: "Ginge - Reset Your Password",
      html: emailTemplates.forgetPassword(otp),
    };

    await sendEmails(email, emailData.subject, emailData.html);
    handlerOk(res, 200, otp, "Otp Sent Successfully");
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id } = req.user;

    const hashPass = await hashPassword(password);

    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        password: hashPass,
      },
    });

    handlerOk(res, 200, null, "Password Update Successfully");
  } catch (error) {
    next(error);
  }
};

const createProfile = async (req, res, next) => {
  try {
    
    const {
      email,
      fullName,
      gender,
      dateOfBirth,
      city,
      states,
      phoneNumber,
      latitude,
      longitude,
      location,
      about,
      country
    } = req.body;
    const { file } = req;
    console.log(file, "file");
    let imageLocation = "";
    if (file) {
      const fileContent = file.buffer;
      const fileNames = file.originalname.split(" ").join("-");
      const extension = path.extname(fileNames);
      const baseName = path.basename(fileNames, extension);
      const newFileName = baseName + "-" + Date.now() + extension;

      if (!fileContent) {
        console.log("File content missing");
      } else {
        try {
          imageLocation = await uploadFileWithFolder(
            fileContent,
            newFileName,
            file.mimetype,
            "user"
          );
        } catch (error) {
          console.error("Error uploading file:", error.message);
        }
      }
    }
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    const checkProfileCreated = await prisma.user.findFirst({
      where: {
        email: email,
        // isCreatedProfile: true,
      },
    });

    if (checkProfileCreated && checkProfileCreated.isCreatedProfile === true) {
      console.log("here")
      throw new ConflictError("Already Created Profile");
    }

    // const newDrinkId = uuidv4();

    const createProfile = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        // id: newDrinkId,
        // email,
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        country,
        city,
        states,
        phoneNumber,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        image: imageLocation,
        isCreatedProfile: true,
        location,
        about,
      },
    });

    await prisma.bar.create({
      data: {
        userId: createProfile?.id,
      },
    });

    // Generate the token with an object as payload
    const token = genToken({
      id: createProfile.id,
      userType: createProfile.userType,
    });

    const refrestToken = generateRefreshToken({
      id: createProfile.id,
      userType: createProfile.userType 
    })

    const response = {userToken: token, refreshToken: refrestToken}

    handlerOk(res, 201, response, "Profile Created Successfully");
  } catch (error) {
    next(error);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const { ...data } = req.body;
    // const { file } = req;
    const { id } = req.user;

    if(req.body.fcmToken){
      await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          deviceToken: req.body.fcmToken
        },
      });
    }
    let imageLocation = "";

    const updatedObj = {};

    if (data.latitude) {
      updatedObj.latitude = parseFloat(data.latitude);
    }
    if (data.longitude) {
      updatedObj.longitude = parseFloat(data.longitude);
    }

    if (data.dateOfBirth) {
      const dateParse = new Date(data.dateOfBirth);
      updatedObj.dateOfBirth = dateParse; // Set as Date object
    }

    // Add other fields from data to updatedObj if they are defined
    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        key !== "latitude" &&
        key !== "longitude" &&
        key !== "dateOfBirth"
      ) {
        updatedObj[key] = value; // Add valid fields to updatedObj
      }
    });

    if (req.file) {
      const { file } = req;
      const fileContent = file.buffer;
      const fileNames = file.originalname.split(" ").join("-");
      const extension = path.extname(fileNames);
      const baseName = path.basename(fileNames, extension);
      const newFileName = baseName + "-" + Date.now() + extension;
      if (!fileContent) {
        console.log("File content missing");
      } else {
        try {
          imageLocation = await uploadFileWithFolder(
            fileContent,
            newFileName,
            file.mimetype,
            "user"
          );
          updatedObj.image = imageLocation;
        } catch (error) {
          console.error("Error uploading file:", error.message);
        }
      }
    }

    const editProfile = await prisma.user.update({
      where: {
        id: id,
      },
      data: updatedObj,
    });

    handlerOk(res, 200, editProfile, "Profile Edit Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.user;

    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    handlerOk(res, 200, null, "user delete successfully");
  } catch (error) {
    next(error);
  }
};

const userFeedBack = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { subject, description } = req.body;
    // const newDrinkId = uuidv4();
    const saveFeedBack = await prisma.feedback.create({
      data: {
        // id: newDrinkId,
        subject,
        description,
        userId: id,
      },
    });

    handlerOk(res, 201, saveFeedBack, "Feed Back Submit Successfully");
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id, password } = req.user;

    const { existingPassword, newPassword } = req.body;

    const existingPass = await comparePassword(existingPassword, password);

    if (!existingPass) {
      throw new BadRequestError("Existing Password is Not Correct");
    }

    const hashPass = await hashPassword(newPassword);

    const changePass = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        password: hashPass,
      },
    });

    handlerOk(res, 200, null, "Password Changed Successfully");
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const findUser = await prisma.user.findFirst({
      where: {
        id: id,
      },
    });
    if (!findUser) {
      throw new NotFoundError("User Not Found");
    }

    handlerOk(res, 200, findUser, "Profile Fetch Successfully");
  } catch (error) {
    next(error);
  }
};

const refreshUser = async (req, res, next) => {
  const { refresh_token } = req.body;
  try {
    const access_token = refreshAccessToken(refresh_token);
    if (!access_token) {
      throw new ForbiddenError("Invalid Refresh Token.")
    }
    handlerOk(res, 200, {userToken: access_token}, "Referesh token generated Successfully");
  } catch (error) {
    next(error);
  }
};

const logout = async( req, res, next ) => {
  try {
    const { id } = req.user;
    
    await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        deviceToken: null
      },
    })
    handlerOk(res, 200, null, "Logout Successfully");

  } catch (error) {
    next(error);
  }
}

const updateuserNotify = async (req, res) => {
  try {
    const { id } = req.user;
    const user = req.user;
    const updateuser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isNotify: !user.isNotify,
      },
    });

    handlerOk(res, 200, { notification_status: updateuser.isNotify }, "User Notification Status Updated");
  } catch (error) {
    const response = serverErrorResponse(error.message);
    return res.status(response.status.code).json(response);
  }
};

const updateuserBot = async (req, res) => {
  try {
    const { id } = req.user;
    const user = req.user;
    const updateuser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isBotOpen: !user.isBotOpen,
      },
    });

    handlerOk(res, 200, { bot_status: updateuser.isBotOpen }, "User Notification Status Updated");
  } catch (error) {
    const response = serverErrorResponse(error.message);
    return res.status(response.status.code).json(response);
  }
};

module.exports = {
  userRegister,
  userLogin,
  verifyOtp,
  forgetPassword,
  resetPassword,
  createProfile,
  editProfile,
  deleteAccount,
  userFeedBack,
  changePassword,
  getProfile,
  resentOTP,
  refreshUser,
  logout,
  updateuserNotify,
  updateuserBot,
};
