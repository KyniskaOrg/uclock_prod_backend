const { Op } = require("sequelize");
const { Project, Client } = require("../models");

const createProject = async (req, res, next) => {
  const { projectName, clientId } = req.body;

  try {
    // Check if the project already exists
    const existingProject = await Project.findOne({
      where: { name: projectName },
    });
    if (existingProject) {
      return res.status(400).json({ message: "Project already exists." });
    }

    // If clientId is provided, validate it
    if (clientId) {
      const client = await Client.findByPk(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found." });
      }
    }

    // Create the project with or without clientId
    await Project.create({
      name: projectName,
      client_id: clientId || null, // Set client_id to null if not provided
    });

    return res.status(201).json({ message: "Project created successfully." });
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    // Get query parameters for pagination, sorting, and filtering
    const { page = 1, sortBy, sortOrder, searchText, limit = 10 } = req.query;

    // Pagination setup
    //  // Default to 10 projects per page
    const offset = (page - 1) * limit; // Calculate the offset based on the page

    // Build where condition for filtering by projectName if provided
    const whereCondition = searchText
      ? { name: { [Op.iLike]: `%${searchText}%` } }
      : {};

    // Build the sorting condition
    const order =
      sortBy || sortOrder ? [[sortBy, sortOrder.toUpperCase()]] : [];

    // Fetch projects with pagination, sorting, and filtering
    const projects = await Project.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: order,
      include: [
        {
          model: Client,
          attributes: ["name"],
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
    next(error);
  }
};

const editProject = async (req, res, next) => {
  const { project_id, projectName, client_id } = req.body;
  try {
    // Find the project by ID
    const project = await Project.findByPk(project_id);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    let updatedProjectData = {};

    if (projectName) {
      updatedProjectData = { name: projectName };
    } // If clientId is provided, validate it
    if (client_id) {
      const client = await Client.findByPk(client_id);
      if (!client) {
        return res.status(404).json({ message: "Client not found." });
      }
      updatedProjectData = { ...updatedProjectData, client_id };
    }

    // Update the project
    await project.update(updatedProjectData);

    return res.status(200).json({ message: "Project updated successfully." });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const { project_ids } = req.body;
  try {
    // Check if project_ids is an array
    if (!Array.isArray(project_ids)) {
      return res.status(400).json({ message: "Invalid project IDs." });
    }

    // Delete projects with the specified IDs
    const deletedCount = await Project.destroy({
      where: { project_id: { [Op.in]: project_ids } },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "No projects found to delete." });
    }

    return res.status(200).json({ message: "Projects deleted successfully." });
  } catch (error) {
    next(error);
  }
};
module.exports = { createProject, getAllProjects, editProject, deleteProject };
