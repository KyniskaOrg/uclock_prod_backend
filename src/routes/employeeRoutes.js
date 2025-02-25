const express = require("express");
const {
  createEmployee,
  editEmployee,
  getAllEmployees,
  deleteEmployee
} = require("../controllers/employeeController");
const {
  validateCreateEmployee,
  validateGetAllEmployees,
  validateEditEmployee,
  validateDeleteEmployee
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createEmployee", validateCreateEmployee, createEmployee); // Create client
router.post("/editEmployee", validateEditEmployee, editEmployee); // Edit client
router.post("/deleteEmployee", validateDeleteEmployee, deleteEmployee); // Edit client
router.get("/getAllEmployees", validateGetAllEmployees, getAllEmployees); // get clients list

module.exports = router;


 
