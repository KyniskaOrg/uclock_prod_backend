module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_id:{
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
    },
    start_date: {
      type: DataTypes.DATEONLY,
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
  });

  Project.associate = (models) => {
    Project.hasMany(models.Timesheet, { foreignKey: 'project_id' });
    Project.belongsToMany(models.Team, {
      through: 'Project_Team',
      foreignKey: 'project_id',
    });
    Project.belongsTo(models.Client, { foreignKey: 'client_id' });
  };

  return Project;
};
