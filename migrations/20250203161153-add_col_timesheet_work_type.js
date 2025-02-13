"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'regular' to the existing ENUM type
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Timesheets_work_type" ADD VALUE IF NOT EXISTS 'regular'`
    );

    // Now add the column 'work_type' with the correct default value
    await queryInterface.addColumn("Timesheets", "work_type", {
      type: Sequelize.ENUM("night", "regular"),
      defaultValue: "regular", // Default value is 'regular'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column 'work_type' from the 'Timesheets' table
    await queryInterface.removeColumn("Timesheets", "work_type");
  },
};
