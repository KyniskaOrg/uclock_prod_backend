module.exports = (sequelize, DataTypes) => {
  const MonthTime = sequelize.define("MonthTime", {
    MonthTime_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hours_worked: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  MonthTime.associate = (models) => {
    MonthTime.belongsTo(models.Employee, { foreignKey: "employee_id" });
  };

  return MonthTime;
};
