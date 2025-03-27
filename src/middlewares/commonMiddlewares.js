const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const commonMiddleware = (app) => {
  // Body parsing middleware
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cors({ origin: true }));

  // Apply rate limiter to all requests 100 requests in 10 minuits allowed
  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
      headers: true, // Send rate limit info in headers
    })
  );

  // Other middlewares (like helmet, compression, etc.)
  // app.use(helmet());
  // app.use(compression());

  return undefined;
};

module.exports = commonMiddleware;
