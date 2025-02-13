const express = require("express");
const {
  createProject,
  getAllProjects,
} = require("../controllers/projectController");
const {
  validateCreateProject,
  validateGetAllProjects,
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createProject", validateCreateProject, createProject); // Create project
router.get("/getallProjects", validateGetAllProjects, getAllProjects); // Create project

module.exports = router;
