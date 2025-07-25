const express = require("express");
const {
  createProject,
  getAllProjects,
  editProject,
  deleteProject,
} = require("../controllers/projectController");
const {
  validateCreateProject,
  validateGetAllProjects,
  validateEditProject,
  validateDeleteProject,
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createProject", validateCreateProject, createProject); // Create project
router.get("/getallProjects", validateGetAllProjects, getAllProjects); // Create project
router.post("/editProject", validateEditProject, editProject); // Edit project
router.post("/deleteProject", validateDeleteProject, deleteProject); // Delete project

module.exports = router;
