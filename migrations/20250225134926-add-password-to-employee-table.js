const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the password column
    await queryInterface.addColumn("Employees", "password", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "", // Temporary default to avoid null constraint issues
    });

    // Hash the default password
    const hashedPassword = await bcrypt.hash("L@hore110", 10);

    // Update all employees with the hashed password
    await queryInterface.sequelize.query(
      `UPDATE "Employees" SET "password" = :hashedPassword`,
      { replacements: { hashedPassword } }
    );

    return queryInterface.changeColumn("Employees", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the password column if we rollback
    return queryInterface.removeColumn("Employees", "password");
  },
};
