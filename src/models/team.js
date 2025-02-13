 
module.exports = (sequelize, DataTypes) => {
    const Team = sequelize.define('Team', {
      team_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
    });
  
    Team.associate = (models) => {
      Team.belongsToMany(models.Employee, {
        through: 'Employee_Team',
        foreignKey: 'team_id',
      });
      Team.belongsToMany(models.Project, {
        through: 'Project_Team',
        foreignKey: 'team_id',
      });
    };
  
    return Team;
  };
  