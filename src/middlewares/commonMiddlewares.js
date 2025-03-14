const bodyParser = require("body-parser");
const cors = require("cors");

const commonMiddleware = (app) => {
  // Body parsing middleware
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cors({ origin: true }));

  // Other middlewares (like helmet, compression, etc.)
  // app.use(helmet());
  // app.use(compression());

  return undefined;
};

module.exports = commonMiddleware;
