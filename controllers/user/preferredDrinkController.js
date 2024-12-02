const prisma = require("../../config/prismaConfig");
const { NotFoundError } = require("../../CustomError");
const { handlerOk } = require("../../resHandler/responseHandler");
const { generateContentForInHouse, generateImage } = require("../../vertex");
const { v4: uuidv4 } = require("uuid"); // Import UUID

const getPreferredDrinks = async (req, res, next) => {
    try {
        const { id } = req.user;

        const allDrinks = await prisma.preferredDrink.findMany({
            where: {
                userId: id
            }
        })
        handlerOk(res, 200, allDrinks, "Fetched all Preferred Drinks Successfully");
    } catch (error) {
        next(error);
    }
}

const singleDrink = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { drinkId } = req.params;

        const drink = await prisma.preferredDrink.findFirst({
            where: {
                id: drinkId,
                userId: id
            }
        })

        handlerOk(res, 200, drink, "Fetched Preferred Drink Successfully");
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
        FROM preferredDrink
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

const getDrinkByCategory = async (req, res, next) => {
    try {
        const { category } = req.query;
        const { id } = req.user;

        const allDrink = await prisma.preferredDrink.findMany({
            where: {
                userId: id,
                category: category
            }
        })

        handlerOk(res, 200, allDrink, "Fetched Preferred Drink Successfully");

    } catch (error) {
        console.log("error; ", error)
        next(error)
    }
}

module.exports = {
    getPreferredDrinks,
    singleDrink,
    getAllCategories,
    getDrinkByCategory
} 