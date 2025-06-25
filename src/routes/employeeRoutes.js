const express = require("express");
const {
  createEmployee,
  editEmployee,
  getAllEmployees,
  deleteEmployee,
  getEmployeesWithNoEntry,
  setEmployeePosition,
  createTeamGroup,
  getAllTeamGroups,
  addEmployeeToTeamGroup,
  getAllTeamGroupsMembers,
  removeEmployeeFromTeamGroup,
  deleteTeamGroup
} = require("../controllers/employeeController");
const {
  validateCreateEmployee,
  validateGetAllEmployees,
  validateEditEmployee,
  validateDeleteEmployee,
  validateGetEmployeesWithNoEntry,
  validateSetEmployeePosition,
  validateCreateTeamGroup,
  validateGetAllTeamGroups,
  validateAddEmployeeToTeamGroup,
  validateGetAllTeamGroupsMembers,
  validateRemoveEmployeeFromTeamGroup,
  validateDeleteTeamGroup
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createEmployee", validateCreateEmployee, createEmployee); // Create client
router.post("/editEmployee", validateEditEmployee, editEmployee); // Edit client
router.post("/deleteEmployee", validateDeleteEmployee, deleteEmployee); // Edit client
router.get("/getAllEmployees", validateGetAllEmployees, getAllEmployees); // get clients list
router.post(
  "/setEmployeePosition",
  validateSetEmployeePosition,
  setEmployeePosition
);
router.get(
  "/getEmployeesWithNoEntry",
  validateGetEmployeesWithNoEntry,
  getEmployeesWithNoEntry
); // get clients list

// team group routes
router.post("/createTeamGroup", validateCreateTeamGroup, createTeamGroup); // Create  team group
router.post("/deleteTeamGroup", validateDeleteTeamGroup, deleteTeamGroup); // Delete team group
router.post(
  "/addEmployeeToTeamGroup",
  validateAddEmployeeToTeamGroup,
  addEmployeeToTeamGroup
); // Add employee to team group
router.post("/removeEmployeeFromTeamGroup", validateRemoveEmployeeFromTeamGroup, removeEmployeeFromTeamGroup); // Remove employee from team group
router.get("/getAllTeamGroups", validateGetAllTeamGroups, getAllTeamGroups); // Get all team groups
router.get(
  "/getAllTeamGroupsMembers",
  validateGetAllTeamGroupsMembers,
  getAllTeamGroupsMembers
); // Get all team group members

module.exports = router;
