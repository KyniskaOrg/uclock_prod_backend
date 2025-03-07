const Sentry = require("@sentry/node");

const errorHandler = (app) => {
  app.use((error, req, res, next) => {
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || "Something went wrong";
    console.log(error);
    // Capture error in Sentry only in production
    if (process.env.NODE_ENV === "prod") {
      Sentry.captureException(error);
    }
    res.status(statusCode).json({
      success: false,
      message,
    });
  });
};

module.exports = errorHandler;
