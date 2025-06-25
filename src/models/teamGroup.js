module.exports = (sequelize, DataTypes) => {
  const TeamGroup = sequelize.define('TeamGroup', {
    group_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    supervisor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'employee_id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  TeamGroup.associate = (models) => {
    TeamGroup.belongsTo(models.Employee, { as: 'Supervisor', foreignKey: 'supervisor_id' });
    TeamGroup.belongsToMany(models.Employee, {
      through: 'TeamGroupMembers',
      as: 'Members',
      foreignKey: 'group_id',
      otherKey: 'employee_id',
    });
  };

  return TeamGroup;
};