const fs = require("fs");
const path = require("path");

const projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./projects.json"), "utf-8")
);

const clientMapping = {
  "DTE": 1,
  "MATIS FORCE": 2,
  "MegaTempo": 3,
  "Mundo Potencial": 4,
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const mappedProjects = projects.map((project) => ({
      name: project.Project,
      client_id: clientMapping[project.Client] || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Projects", mappedProjects, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Projects", null, {});
  },
};
