const express = require("express");
const { registerUser } = require("../controllers/userController");
const { loginUser } = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/register", validateRegister, registerUser); // Register route
router.post("/login", validateLogin, loginUser); // Login route

module.exports = router;
