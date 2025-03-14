const Sentry = require("@sentry/node");

const errorHandler = (app) => {
  app.use((error, req, res, next) => {
    const statusCode = error.status || error.statusCode || 500;
    const message = error.message || "Something went wrong";
    if (process.env.NODE_ENV === "local") {
      console.log(
        "_________________________error___________________________",
        error,
        "_________________________error___________________________"
      );
    }
    // Capture error in Sentry only in production
    if (process.env.NODE_ENV === "prod") {
      Sentry.captureException(error);
    }
    // send error message
    res.status(statusCode).json({
      success: false,
      message,
    });
  });
};

module.exports = errorHandler;
