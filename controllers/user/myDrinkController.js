const { NotFound } = require("@aws-sdk/client-s3");
const prisma = require("../../config/prismaConfig");
const { handlerOk } = require("../../resHandler/responseHandler");
const { NotFoundError, ConflictError } = require("../../CustomError");
const { v4: uuidv4 } = require("uuid"); // Import UUID

const saveMyDrink = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { drinkId } = req.params;
    // let drink = null;
    // const findRecommendedDrink = await prisma.recommendeddrink.findFirst({
    //   where: {
    //     id: drinkId,
    //     userId: id,
    //   },
    // });

    // const findInHouseDrink = await prisma.inhousedrink.findFirst({
    //   where: {
    //     id: drinkId,
    //     userId: id,
    //   },
    // });

    // const findPreferredDrink = await prisma.preferredDrink.findFirst({
    //   where: {
    //     id: drinkId,
    //     userId: id,
    //   },
    // });

    // if(findRecommendedDrink){
    //   drink = findRecommendedDrink;
    //   await prisma.recommendeddrink.update({
    //     where: {
    //       id: findRecommendedDrink.id,
    //     },
    //     data: {
    //       isSaved: true
    //     },
    //   })
    // }else if(findInHouseDrink){
    //   drink = findInHouseDrink;
    //   await prisma.inhousedrink.update({
    //     where: {
    //       id: findInHouseDrink.id,
    //     },
    //     data: {
    //       isSaved: true
    //     },
    //   })
    // } else if(findPreferredDrink){
    //   drink = findPreferredDrink;
    //   await prisma.preferredDrink.update({
    //     where: {
    //       id: findPreferredDrink.id,
    //     },
    //     data: {
    //       isSaved: true
    //     },
    //   })
    // }
    // else{
    //   drink = null;
    // }

    // if (!findRecommendedDrink && !findInHouseDrink && !findPreferredDrink) {
    //   throw new NotFoundError("Drinks not found");
    // }

    // const checkDrink = await prisma.mydrink.findFirst({
    //   where:{
    //     drinkId: drink?.id
    //   }
    // })

    // if (checkDrink) {
    //   throw new ConflictError("already exist in your drinks");
    // }

    // const saveMyDrink = await prisma.mydrink.create({
    //   data: {
    //     title: drink?.title,
    //     ingredient: drink?.ingredient,
    //     procedure: drink?.procedure,
    //     img: drink?.img,
    //     drinkId: drink?.id,
    //     userId: id,
    //   },
    // });

    const drinkTypes = ['recommendeddrink', 'inhousedrink', 'preferredDrink'];
    let drink = null;
    

    for (const type of drinkTypes) {
      const foundDrink = await prisma[type].findFirst({
        where: {
          id: drinkId,
          userId: id,
        },
      });

      if (foundDrink) {
        drink = foundDrink;

        await prisma[type].update({
          where: {
            id: foundDrink.id,
          },
          data: {
            isSaved: true,
          },
        });

        break; // Exit the loop once a drink is found
      }
    }

    if (!drink) {
      throw new NotFoundError("Drinks not found");
    }

    handlerOk(res, 200, drink, "Drink saved successfully");
  } catch (error) {
    next(error);
  }
};

const getMyDrinks = async (req, res, next) => {
  try {
    const { id } = req.user;

    const drinkTypes = ['recommendeddrink', 'inhousedrink', 'preferredDrink'];

    const results = await Promise.all(
      drinkTypes.map((type) =>
        prisma[type].findMany({
          where: {
            userId: id,
            isSaved: true
          },
        })
      )
    );

    // Combine all results into a single array
    const allDrinks = results.flat();
    console.log("allDrinks: ", allDrinks);

    // const findMyDrink = await prisma.mydrink.findMany({
    //   where: {
    //     userId: id,
    //   },
    // });

    // if (!findMyDrink) {
    //   throw new NotFoundError("Drinks Not Found");
    // }

    handlerOk(res, 200, allDrinks, "Drinks Found Successfully");
  } catch (error) {
    next(error);
  }
};

const getMyDrink = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { drinkId } = req.params;
    const drinkTypes = ['recommendeddrink', 'inhousedrink', 'preferredDrink'];

    let drink = null;
    for (const type of drinkTypes) {
      const foundDrink = await prisma[type].findFirst({
        where: {
          id: drinkId,
          userId: id,
        },
      });

      if (foundDrink) {
        drink = foundDrink;
        break; // Exit the loop once a drink is found
      }
    }

    if (!drink) {
      throw new NotFoundError("Drinks not found");
    }

    handlerOk(res, 200, drink, "Drinks Found Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteMyDrink = async (req, res, next) => {
  try {
    const { drinkId } = req.params;
    console.log("drinkId: ", drinkId)
    const { id } = req.user;
    // const findDrink = await prisma.mydrink.findFirst({
    //   where: {
    //     drinkId: drinkId,
    //     userId: id,
    //   },
    // });

    // if (!findDrink) {
    //   throw new NotFoundError("Drink Not Found");
    // } else {

    //   const findRecommendedDrink = await prisma.recommendeddrink.findFirst({
    //     where: {
    //       id: drinkId,
    //       userId: id,
    //     },
    //   });

    //   if (findRecommendedDrink) {
    //     console.log("findRecommendedDrink: ")
    //     await prisma.recommendeddrink.update({
    //       where: {
    //         id: findRecommendedDrink.id,
    //       },
    //       data: {
    //         isSaved: false
    //       },
    //     })
    //   }

    //   const findInHouseDrink = await prisma.inhousedrink.findFirst({
    //     where: {
    //       id: drinkId,
    //       userId: id,
    //     },
    //   });

    //   if (findInHouseDrink) {
    //     console.log("findInHouseDrink: ")
    //     await prisma.inhousedrink.update({
    //       where: {
    //         id: findInHouseDrink.id,
    //       },
    //       data: {
    //         isSaved: false
    //       },
    //     })
    //   }
    // }

    // await prisma.mydrink.delete({
    //   where: {
    //     id: findDrink.id,
    //   },
    // });

    const drinkTypes = ['recommendeddrink', 'inhousedrink', 'preferredDrink'];
    let drink = null;

    for (const type of drinkTypes) {
      const foundDrink = await prisma[type].findFirst({
        where: {
          id: drinkId,
          userId: id,
        },
      });

      if (foundDrink) {
        drink = foundDrink;

        await prisma[type].update({
          where: {
            id: foundDrink.id,
          },
          data: {
            isSaved: false,
          },
        });

        break; // Exit the loop once a drink is found
      }
    }
    handlerOk(res, 200, null, "Drink delete Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveMyDrink,
  getMyDrinks,
  deleteMyDrink,
  getMyDrink
};
