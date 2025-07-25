const express = require("express");
const {
  createClient,
  getAllClients,
  updateClient,
  deleteClient,
} = require("../controllers/ClientController");
const {
  validateCreateClient,
  validateGetAllClients,
  validateDeleteClient,
  validateUpdateClient
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.post("/createClient", validateCreateClient, createClient); // Create client
router.get("/getAllClients", validateGetAllClients, getAllClients); // get clients list
router.post("/deleteClient", validateDeleteClient, deleteClient); // delete clients
router.post("/updateClient", validateUpdateClient, updateClient); // update client

module.exports = router;
