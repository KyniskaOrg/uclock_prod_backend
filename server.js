require("dotenv").config();
const express = require("express");
const Gl = require("greenlock-express");
const { sequelize } = require("./src/models");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
require("./srcComplains/auth")(passport);

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const timesheetRoutes = require("./src/routes/timesheetRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const clientRoutes = require("./src/routes/clientRoutes");

// Initialize app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/client", clientRoutes);
// app.use('/api/teams', teamRoutes);
// app.use('/api/reports', reportRoutes);
app.use("/api/test", () => {
  console.log("test passed");
});

// complain routes
app.use(require("./srcComplains/routes"));

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// mongo  for complain setup
mongoose.connect(
  process.env.mongo_url,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Mongo connected successfully.");
    }
  }
);

//ssl setup
Gl.init({
  packageRoot: __dirname,
  configDir: "greenlock.d",
  debug: true,
  // contact for security and critical bug notices
  maintainerEmail: "ahmed@kyniska.eu",

  // whether or not to run at cloudscale
  cluster: false,
})
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(app);
