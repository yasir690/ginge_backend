const prisma = require("../../config/prismaConfig");
const {
  ConflictError,
  NotFoundError,
  BadRequestError,
} = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");

const getAppInfo = async (req, res, next) => {
  try {
    const { detail } = req.query;
    let data;

    switch (detail) {
      case "termsAndCondition":
        data = await prisma.termscondition.findMany();
        break;
      case "privacyPolicy":
        data = await prisma.privacypolicy.findMany();
        break;
      case "aboutApp":
        data = await prisma.aboutapp.findMany();
        break;
      default:
        throw new ConflictError("Invalid details")
    }

    handlerOk(res, 200, data, `${detail} fetched Successfully`);

  } catch (error) {
    next(error)
  }
}

const updateAppInfo = async (req, res, next) => {
  try {
    const {id} = req.user;
    const { detail } = req.query;
    const {content} = req.body;
    let data;

    switch (detail) {
      case "termsAndCondition":
        data = await prisma.termscondition.findMany();

        if(data.length < 1){

          await prisma.termscondition.create({
            data:{
              text: content,
              createdBy: id
            }
          })

        }else {

          await prisma.termscondition.update({
            where: {
              id: data[0]?.id
            },
            data:{
              text: content
            }
          })

        }

        break;
      case "privacyPolicy":
        data = await prisma.privacypolicy.findMany();

        if(data.length < 1){

          await prisma.privacypolicy.create({
            data:{
              text: content,
              createdBy: id
            }
          })

        }else {

          await prisma.privacypolicy.update({
            where: {
              id: data[0]?.id
            },
            data:{
              text: content
            }
          })

        }
        break;
      case "aboutApp":
        data = await prisma.aboutapp.findMany();
        if(data.length < 1){

          await prisma.aboutapp.create({
            data:{
              text: content,
              createdBy: id
            }
          })

        }else {

          await prisma.aboutapp.update({
            where: {
              id: data[0]?.id
            },
            data:{
              text: content
            }
          })

        }
        break;
      default:
        throw new ConflictError("Invalid details")
    }

    handlerOk(res, 200, data, `${detail} fetched Successfully`);

  } catch (error) {
    next(error)
  }
}

const userFeedBack = async (req, res, next) => {
  try {
    const foundFeedBack = await prisma.feedback.findMany({
      include: {
        user: true, // Include user details associated with each feedback
      },
    });

    const updateData = foundFeedBack.map((data) => {
      return {
        id: data.id,
        subject: data.subject,
        description: data.description,
        user: {
          id: data.user.id,
          fullName: data.user.fullName,
          email: data.user.email,
          gender: data.user.gender,
          dataOfBirth: data.user.dateOfBirth,
          city: data.user.city,
          states: data.user.states,
          phoneNumber: data.user.phoneNumber,
          image: data.user.image,
        },
      };
    });
    handlerOk(res, 200, updateData, "Feed Back Found Successfully");
  } catch (error) {
    next(error);
  }
};

// const createTermsCondition = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const { text } = req.body;

//     const checkExist = await prisma.termscondition.findFirst();
//     if (checkExist) {
//       throw new ConflictError("Terms Condition create only once");
//     }

//     const saveTermsCondition = await prisma.termscondition.create({
//       data: {
//         text,
//         createdBy: id,
//       },
//     });
//     handlerOk(
//       res,
//       201,
//       saveTermsCondition,
//       "TermsCondition Create Successfully"
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// const getTermsCondition = async (req, res, next) => {
//   try {
//     const foundTermsCondition = await prisma.termscondition.findMany();

//     handlerOk(
//       res,
//       200,
//       foundTermsCondition,
//       "TermsCondition Found Successfully"
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// const updateTermsCondition = async (req, res, next) => {
//   try {
//     const { termsId } = req.params;
//     const { text } = req.body;

//     const findId = await prisma.termscondition.findFirst({
//       where: {
//         id: termsId,
//       },
//     });
//     if (!findId) {
//       throw new NotFoundError("TermsCondition Id Not Found");
//     }

//     const updateTerms = await prisma.termscondition.update({
//       where: {
//         id: termsId,
//       },
//       data: {
//         text,
//       },
//     });

//     handlerOk(res, 200, updateTerms, "TermsCondition Update Successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// const createPrivacyPolicy = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const { text } = req.body;
//     const checkExist = await prisma.privacypolicy.findFirst();
//     if (checkExist) {
//       throw new ConflictError("Privacy Policy Create Only Once");
//     }

//     const savePrivacyPolicy = await prisma.privacypolicy.create({
//       data: {
//         text,
//         createdBy: id,
//       },
//     });
//     handlerOk(
//       res,
//       201,
//       savePrivacyPolicy,
//       "Privacy Policy Created Successfully"
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// const getPrivacyPolicy = async (req, res, next) => {
//   try {
//     const foundTermsCondition = await prisma.privacypolicy.findMany();

//     handlerOk(
//       res,
//       200,
//       foundTermsCondition,
//       "Privacy Policy Found Successfully"
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// const updatePrivacyPolicy = async (req, res, next) => {
//   try {
//     const { privacyId } = req.params;
//     const { text } = req.body;

//     const findId = await prisma.privacypolicy.findFirst({
//       where: {
//         id: privacyId,
//       },
//     });
//     if (!findId) {
//       throw new NotFoundError("Privacy Id Not Found");
//     }

//     const updatePrivacy = await prisma.privacypolicy.update({
//       where: {
//         id: privacyId,
//       },
//       data: {
//         text,
//       },
//     });

//     handlerOk(res, 200, updatePrivacy, "Privacy Policy Updated Successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// const createAboutApp = async (req, res, next) => {
//   try {
//     const { id } = req.user;
//     const { text } = req.body;

//     const checkExist = await prisma.aboutapp.findFirst();
//     if (checkExist) {
//       throw new ConflictError("About App Create Only Once");
//     }

//     const saveAboutApp = await prisma.aboutapp.create({
//       data: {
//         text,
//         createdBy: id,
//       },
//     });
//     handlerOk(res, 201, saveAboutApp, "About App Created Successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// const getAboutApp = async (req, res, next) => {
//   try {
//     const foundTermsCondition = await prisma.aboutapp.findMany();

//     handlerOk(res, 200, foundTermsCondition, "About App Found Successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// const updateAboutApp = async (req, res, next) => {
//   try {
//     const { aboutId } = req.params;
//     const { text } = req.body;

//     const findId = await prisma.aboutapp.findFirst({
//       where: {
//         id: aboutId,
//       },
//     });
//     if (!findId) {
//       throw new NotFoundError("About App Id Not Found");
//     }

//     const updateAbout = await prisma.aboutapp.update({
//       where: {
//         id: aboutId,
//       },
//       data: {
//         text,
//       },
//     });

//     handlerOk(res, 200, updateAbout, "About App Updated Successfully");
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  userFeedBack,
  // createTermsCondition,
  // getTermsCondition,
  // updateTermsCondition,
  // createPrivacyPolicy,
  // getPrivacyPolicy,
  // updatePrivacyPolicy,
  // createAboutApp,
  // getAboutApp,
  // updateAboutApp,

  getAppInfo,
  updateAppInfo
};
