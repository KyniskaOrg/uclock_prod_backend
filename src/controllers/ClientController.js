const { Op } = require("sequelize");
const { Client } = require("../models");

const createClient = async (req, res) => {
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
    return res.status(500).json({ message: "Server error.", error });
  }
};

const getAllClients = async (req, res) => {
  try {
    // Get query parameters for pagination, sorting, and filtering
    const {
      page = 1,
      sortBy,
      sortOrder,
      searchText,
      limit = 10,
    } = req.query;

    // Pagination setup
    //  // Default to 10 clients per page
    const offset = (page - 1) * limit; // Calculate the offset based on the page

    // Build where condition for filtering by clientName if provided
    const whereCondition = searchText
      ? { name: { [Op.iLike]: `%${searchText}%` } }
      : {};

    // Build the sorting condition
    const order = sortBy||sortOrder?[[sortBy, sortOrder.toUpperCase()]]:[];
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
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = { createClient, getAllClients };
