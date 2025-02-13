const express = require("express");
const {
  createEmployee,
  getAllEmployees,
  editEmployee
} = require("../controllers/employeeController");
const {
  validateCreateEmployee,
  validateGetAllEmployees,
  validateEditEmployee
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createEmployee", validateCreateEmployee, createEmployee); // Create client
router.get("/getAllEmployees", validateGetAllEmployees, getAllEmployees); // get clients list
router.post("/editEmployee", validateEditEmployee, editEmployee); // Edit client


module.exports = router;


 
