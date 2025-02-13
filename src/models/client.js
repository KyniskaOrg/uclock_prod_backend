module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
      client_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    });
  
    Client.associate = (models) => {
      Client.hasMany(models.Project, { foreignKey: 'client_id' });
    };
  
    return Client;
  };
  