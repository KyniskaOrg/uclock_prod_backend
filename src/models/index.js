const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
});

const models = {
  User: require('./user')(sequelize, DataTypes),
  Employee: require('./employee')(sequelize, DataTypes),
  Timesheet: require('./timesheet')(sequelize, DataTypes),
  Project: require('./project')(sequelize, DataTypes),
  Team: require('./team')(sequelize, DataTypes),
  Client: require('./client')(sequelize, DataTypes),
  MonthTime: require('./monthTime')(sequelize, DataTypes),
  TeamGroup: require('./teamGroup')(sequelize, DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

