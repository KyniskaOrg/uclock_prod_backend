'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('Timesheets', ['employee_id', 'project_id', 'date'], {
      name: 'idx_timesheets_employee_project_date',
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Timesheets', 'idx_timesheets_employee_project_date');
  }
};
