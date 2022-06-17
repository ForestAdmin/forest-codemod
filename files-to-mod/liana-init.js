const chalk = require('chalk');
const path = require('path');
const Liana = require('forest-express-mongoose');
const mongoose = require('mongoose');

module.exports = async function forestadmin(app) {
  app.use(await Liana.init({
    modelsDir: path.join(__dirname, '../models'),
    configDir: path.join(__dirname, '../forest'),
    secretKey: process.env.FOREST_ENV_SECRET,
    authKey: process.env.FOREST_AUTH_SECRET,
    mongoose,
  }));

  console.log(chalk.cyan('Your admin panel is available here: https://app.forestadmin.com/projects'));
};
