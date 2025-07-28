const { Op } = require('sequelize');
const { Project, Client } = require('../models');

const createProject = async (req, res, next) => {
  const { projectName, clientId } = req.body;

  try {
    // Check if the project already exists
    const existingProject = await Project.findOne({ where: { name: projectName } });
    if (existingProject) {
      return res.status(400).json({ message: 'Project already exists.' });
    }

    // If clientId is provided, validate it
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({ message: 'Client not found.' });
      }
    }

    // Create the project with or without clientId
    await Project.create({
      name: projectName,
      client_id: clientId || null, // Set client_id to null if not provided
    });

    return res.status(201).json({ message: 'Project created successfully.' });
  } catch (error) {
    next(error)
  }
};


const getAllProjects = async (req, res, next) => {
  try {
    // Get query parameters for pagination, sorting, and filtering
    const { page = 1, sortBy, sortOrder, searchText, limit=10 } = req.query;

    // Pagination setup
    //  // Default to 10 projects per page
    const offset = (page - 1) * limit; // Calculate the offset based on the page

    // Build where condition for filtering by projectName if provided
    const whereCondition = searchText ? { name: { [Op.iLike]: `%${searchText}%` } } : {};

    // Build the sorting condition
    const order = sortBy||sortOrder?[[sortBy, sortOrder.toUpperCase()]]:[];

    // Fetch projects with pagination, sorting, and filtering
    const projects = await Project.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: order,
      include: [
        {
          model: Client,
          attributes: ['name'],
        },
      ],
    });

    // Calculate total pages based on the count of projects and the limit
    const totalPages = Math.ceil(projects.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalProjects: projects.count,
      projects: projects.rows,
    });
  } catch (error) {
    next(error)
  }
};


module.exports = { createProject,getAllProjects };
