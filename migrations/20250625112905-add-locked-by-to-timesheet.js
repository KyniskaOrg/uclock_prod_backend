'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Timesheets', 'locked_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Employees', // Assumes you have a Users table
        key: 'employee_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Timesheets', 'locked_by');
  }
};