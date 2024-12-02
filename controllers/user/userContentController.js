const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const getUserPrivacyPolicy = async (req, res, next) => {
  try {
    const findUserPrivacy = await prisma.privacypolicy.findMany({});

    if (findUserPrivacy.length === 0) {
      throw new NotFoundError("Privacy Policy Not Found");
    }

    handlerOk(res, 200, findUserPrivacy, "Privacy Policy Found Successfully");
  } catch (error) {
    next(error);
  }
};

const getUserTermsCondition = async (req, res, next) => {
  try {
    const findUserTerms = await prisma.termscondition.findMany();

    if (findUserTerms.length === 0) {
      throw new NotFoundError("Terms Condition Not Found");
    }

    handlerOk(res, 200, findUserTerms, "Terms Condition Found Successfully");
  } catch (error) {
    next(error);
  }
};

const getUserAboutApp = async (req, res, next) => {
  try {
    const findUserAboutApp = await prisma.aboutapp.findMany();

    if (findUserAboutApp.length === 0) {
      throw new NotFoundError("About App Not Found");
    }

    handlerOk(res, 200, findUserAboutApp, "About App Found Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPrivacyPolicy,
  getUserTermsCondition,
  getUserAboutApp,
};
