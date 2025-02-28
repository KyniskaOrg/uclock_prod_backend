const express = require("express");
const { registerUser } = require("../controllers/userController");
const { loginUser, loginEmployee } = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateLoginEmployee
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/register", validateRegister, registerUser); // Register route
router.post("/login", validateLogin, loginUser); // Login route
router.post("/loginEmployee", validateLoginEmployee, loginEmployee); // Login route



module.exports = router;
