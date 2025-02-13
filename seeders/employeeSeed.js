const fs = require('fs');
const path = require('path');
const { Employee } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Load the JSON file
    const employeesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, './employees.json'), 'utf-8')
    );

    // Transform data to match Employee model structure
    const employees = employeesData.map((emp) => ({
      name: emp.Name,
      email: emp.Email,
      position: emp.Role || null,
      user_id: null, // Assuming no user_id is provided in JSON
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert data into the database
    await queryInterface.bulkInsert('Employees', employees, {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all seeded employees
    await queryInterface.bulkDelete('Employees', null, {});
  },
};
