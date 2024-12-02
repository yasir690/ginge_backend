const moment = require("moment");

const getWeekNumber = (date) => {
    const copiedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    copiedDate.setUTCDate(
      copiedDate.getUTCDate() + 4 - (copiedDate.getUTCDay() || 7)
    );

    const yearStart = new Date(Date.UTC(copiedDate.getUTCFullYear(), 0, 1));

    const weekNumber = Math.ceil(((copiedDate - yearStart) / 86400000 + 1) / 7);
    return weekNumber;
}

const getDayName = (fdate) => {
    const date = moment.utc(fdate);
    return date.format("ddd");
};

module.exports = {getWeekNumber, getDayName}