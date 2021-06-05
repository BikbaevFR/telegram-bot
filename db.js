const { Sequelize } = require("sequelize");

module.exports = new Sequelize("telegram_bot", "root", "root", {
  host: "95.213.208.244",
  port: "6432",
  dialect: "postgres",
});
