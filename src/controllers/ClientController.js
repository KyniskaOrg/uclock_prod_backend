const { Op } = require("sequelize");
const { Client } = require("../models");

const createClient = async (req, res, next) => {
  const { clientName } = req.body;

  try {
    // Check if the client already exists
    const existingClient = await Client.findOne({
      where: { name: clientName },
    });

    if (existingClient) {
      return res.status(400).json({ message: "client already exists." });
    }

    // Create the client with or without clientId
    await Client.create({
      name: clientName, // Set client_id to null if not provided
    });

    return res.status(201).json({ message: "client created successfully." });
  } catch (error) {
    next(error);
  }
};

const getAllClients = async (req, res, next) => {
  try {
    // Get query parameters for pagination, sorting, and filtering
    const { page = 1, sortBy, sortOrder, searchText, limit = 10 } = req.query;

    // Pagination setup
    //  // Default to 10 clients per page
    const offset = (page - 1) * limit; // Calculate the offset based on the page

    // Build where condition for filtering by clientName if provided
    const whereCondition = searchText
      ? { name: { [Op.iLike]: `%${searchText}%` } }
      : {};

    // Build the sorting condition
    const order =
      sortBy || sortOrder ? [[sortBy, sortOrder.toUpperCase()]] : [];
    // Fetch clients with pagination, sorting, and filtering
    const clients = await Client.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: order,
    });

    // Calculate total pages based on the count of clients and the limit
    const totalPages = Math.ceil(clients.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalClients: clients.count,
      clients: clients.rows,
    });
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  const { client_ids } = req.body;
  console.log(client_ids);
  try {
    // Find the clients
    const clients = await Client.findAll({
      where: {
        client_id: {
          [Op.in]: client_ids,
        },
      },
    });

    if (!clients.length) {
      return res.status(404).json({ message: "Clients not found." });
    }

    // Delete the clients
    await Client.destroy({
      where: {
        client_id: {
          [Op.in]: client_ids,
        },
      },
    });

    return res.status(200).json({ message: "Clients deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  const { client_id } = req.body;
  const { clientName } = req.body;

  console.log(req.body);

  try {
    // Find the client
    const client = await Client.findByPk(client_id);

    if (!client) {
      return res.status(404).json({ message: "Client not found." });
    }

    // Update the client
    client.name = clientName;
    await client.save();

    return res.status(200).json({ message: "Client updated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClient, getAllClients, deleteClient, updateClient };
