module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define("Employee", {
    employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      defaultValue:
        "$2a$10$R4/lYmtRoUt61Fzu53snr.zDxI6f5Kl2poCmNkHbn9mw8sm5ugvkO",
      allowNull: false,
    },
    // user_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
  });

  Employee.associate = (models) => {
    // Employee.belongsTo(models.User, { foreignKey: 'user_id' });
    Employee.hasMany(models.Timesheet, { foreignKey: "employee_id" });
    Employee.belongsToMany(models.Team, {
      through: "Employee_Team",
      foreignKey: "employee_id",
    });
  };

  return Employee;
};
