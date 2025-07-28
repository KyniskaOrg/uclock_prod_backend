const express = require("express");
const {
  createClient,
  getAllClients,
} = require("../controllers/ClientController");
const {
  validateCreateClient,
  validateGetAllClients,
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createClient", validateCreateClient, createClient); // Create client
router.get("/getAllClients", validateGetAllClients, getAllClients); // get clients list

module.exports = router;
