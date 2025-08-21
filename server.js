require("dotenv").config();
const express = require("express");
require("./src/sentry");
const Gl = require("greenlock-express");
const commonMiddleware = require("./src/middlewares/commonMiddlewares");
const errorHandler = require("./src/middlewares/errorMiddleware");
const { sequelize } = require("./src/models");
const mongoose = require("mongoose");
const passport = require("passport");
const serverAdapter = require('./src/bullUi/bullUi.js');
require("./srcComplains/auth")(passport);

// reddis
const { createRedisClient } = require("./src/config/redis.js");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const employeeRoutes = require("./src/routes/employeeRoutes");
const timesheetRoutes = require("./src/routes/timesheetRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const clientRoutes = require("./src/routes/clientRoutes");

// Initialize app
const app = express();

// Middleware setup
commonMiddleware(app);

// Initialize Redis client

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

// bull board setup
app.use('/admin/queues', serverAdapter.getRouter());

// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    createRedisClient();
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
// custom error handler with sentry
errorHandler(app);
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
// Check if running in local mode
if (process.env.NODE_ENV === "local") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
  });
} else {
  // SSL setup only in non-local environments
  const Gl = require("greenlock-express");
  Gl.init({
    packageRoot: __dirname,
    configDir: "greenlock.d",
    debug: true,
    maintainerEmail: "ahmed@kyniska.eu",
    cluster: false,
  }).serve(app);
}
