 
module.exports = (sequelize, DataTypes) => {
    const Timesheet = sequelize.define('Timesheet', {
      timesheet_id: {
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
      work_type: {
        type: DataTypes.ENUM('night', "regular"),
        allowNull: false,
        defaultValue: 'regular'
      },
    });
  
    Timesheet.associate = (models) => {
      Timesheet.belongsTo(models.Employee, { foreignKey: 'employee_id' });
      Timesheet.belongsTo(models.Project, { foreignKey: 'project_id' });
    };
  
    return Timesheet;
  };
  