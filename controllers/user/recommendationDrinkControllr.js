const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { generateContentForInHouse, generateImage } = require("../../vertex");
const { v4: uuidv4 } = require("uuid"); // Import UUID

const getRecommendationDrinks = async (req, res, next) => {
    try {
        const { id } = req.user;
        let {category} = req.query;
        let condition;
        if(category==="ALL"){
            condition={
                userId: id
            }
        }else{
            condition={
                userId: id,
                category: category
            }
        }

        const allDrinks = await prisma.recommendeddrink.findMany({
            where: {
                ...condition
            }
        })
        handlerOk(res, 200, allDrinks, "Fetched all Recommendation Drinks Successfully");
    } catch (error) {
        console.log("err: ", error)
        next(error);
    }
}

const singleDrink = async (req, res, next) => {
    try {
        const { id } = req.user;
        const {drinkId} = req.params;

        const drink = await prisma.recommendeddrink.findFirst({
            where: {
                id: drinkId,
                userId: id
            }
        })
        handlerOk(res, 200, drink, "Fetched Recommendation Drink Successfully");
    } catch (error) {
        next(error);
    }
}

const getAllCategories = async (req, res, next) => {
    try {

        const { id } = req.user;
        const results = await prisma.$queryRaw`
        SELECT category, 
               GROUP_CONCAT(
                   JSON_OBJECT(
                       'id', id,
                       'title', title,
                       'ingredient', ingredient,
                       'procedure', \`procedure\`,
                       'img', img
                   )
               ) AS records
        FROM recommendeddrink
        WHERE userId = ${id}
        GROUP BY category;
    `;

        let allCategories = []
        results.map(result => { allCategories.push(result.category) })

        handlerOk(res, 200, allCategories, "Fetched Preferred Drink Categories Successfully");

    } catch (error) {
        next(error)
    }
}
module.exports = {
    getRecommendationDrinks,
    singleDrink,
    getAllCategories
}