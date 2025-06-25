const { Op } = require("sequelize");
const {
  Employee,
  Timesheet,
  sequelize,
  MonthTime,
  TeamGroup,
} = require("../models");
const teamGroup = require("../models/teamGroup");

const createEmployee = async (req, res, next) => {
  const { name, email } = req.body;

  try {
    // Check if the client already exists
    const existingEmployee = await Employee.findOne({
      where: {
        [Op.or]: [{ name }, { email }],
      },
    });

    if (existingEmployee) {
      return res.status(400).json({ message: "employee already exists." });
    }

    // Create the client with or without clientId
    await Employee.create({
      name,
      email, // Set client_id to null if not provided
    });

    return res.status(201).json({ message: "Employee created successfully." });
  } catch (error) {
    next(error);
  }
};

const editEmployee = async (req, res, next) => {
  const { employee_id, name } = req.body;

  try {
    // Find the employee by employee_id
    const employee = await Employee.findOne({
      where: { employee_id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Update the employee's name
    await employee.update({ name });

    return res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  const { employee_ids } = req.body;
  const transaction = await sequelize.transaction();

  try {
    await Timesheet.destroy(
      { where: { employee_id: employee_ids } },
      { transaction }
    );
    await Employee.destroy(
      { where: { employee_id: employee_ids } },
      { transaction }
    );
    await MonthTime.destroy(
      { where: { employee_id: employee_ids } },
      { transaction }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getAllEmployees = async (req, res, next) => {
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
      sortBy || sortOrder
        ? [[sortBy, sortOrder.toUpperCase()]]
        : [["updatedAt", "DESC"]];
    // Fetch clients with pagination, sorting, and filtering
    const employee = await Employee.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: order,
    });

    // Calculate total pages based on the count of clients and the limit
    const totalPages = Math.ceil(employee.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalEmployees: employee.count,
      employees: employee.rows,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeesWithNoEntry = async (req, res, next) => {
  try {
    const {
      start_date, // e.g., "2024-04-01"
      end_date, // e.g., "2024-05-01"
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "ASC",
    } = req.query;

    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }

    const offset = (page - 1) * limit;
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const employees = await Employee.findAndCountAll({
      attributes: ["name", "employee_id"],
      where: sequelize.literal(`
        NOT EXISTS (
          SELECT 1 FROM "Timesheets" t
          WHERE t."employee_id" = "Employee"."employee_id"
          AND t."date" >= '${start_date}'
          AND t."date" < '${end_date}'
        )
      `),
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    const totalPages = Math.ceil(employees.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalRecords: employees.count,
      monthTime: employees.rows,
    });
  } catch (error) {
    console.error("Error fetching employees with no timesheet entries:", error);
    next(error);
  }
};

setEmployeePosition = async (req, res, next) => {
  const { employee_id, position } = req.body;

  try {
    // Find the employee by employee_id
    const employee = await Employee.findOne({
      where: { employee_id },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Update the employee's position
    await employee.update({ position: position || null });

    return res
      .status(200)
      .json({ message: "Employee position updated successfully." });
  } catch (error) {
    next(error);
  }
};

const createTeamGroup = async (req, res, next) => {
  const { teamName, supervisor_id } = req.body;

  try {
    // Check if the team group already exists
    //
    const existingGroup = await TeamGroup.findOne({
      where: {
        name: teamName,
        supervisor_id,
      },
    });

    if (existingGroup) {
      return res.status(400).json({ message: "Team group already exists." });
    }

    // Create the team group
    const newGroup = await TeamGroup.create({
      name: teamName,
      supervisor_id,
    });

    return res.status(201).json({
      message: "Team group created successfully.",
      group: newGroup,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTeamGroups = async (req, res, next) => {
  try {
    console.log(req.query);
    // Get query parameters for pagination, sorting, and filtering
    const {
      page = 1,
      sortBy,
      sortOrder,
      searchText,
      limit = 20,
      supervisor_id,
    } = req.query;

    // Pagination setup
    const offset = (page - 1) * limit; // Calculate the offset based on the page

    // Build where condition for filtering by name if provided
    let whereCondition = searchText
      ? { name: { [Op.iLike]: `%${searchText}%` } }
      : {};

    whereCondition = {
      ...(supervisor_id && { supervisor_id }), // Filter by supervisor_id if provided
    };
    // Build the sorting condition
    const order =
      sortBy || sortOrder
        ? [[sortBy, sortOrder.toUpperCase()]]
        : [["updatedAt", "DESC"]];

    console.log(whereCondition, order);

    // Fetch team groups with pagination, sorting, and filtering
    const teamGroups = await TeamGroup.findAndCountAll({
      where: whereCondition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: order,
    });

    // Calculate total pages based on the count of team groups and the limit
    const totalPages = Math.ceil(teamGroups.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page),
      totalTeamGroups: teamGroups.count,
      teamGroups: teamGroups.rows,
    });
  } catch (error) {
    next(error);
  }
};

const addEmployeeToTeamGroup = async (req, res, next) => {
  const { employee_ids, team_group_id } = req.body;
  console.log("Adding employees to team group:", {
    employee_ids,
    team_group_id,
  });

  try {
    // Check if the team group exists
    const teamGroup = await TeamGroup.findOne({
      where: { group_id: team_group_id },
    });

    if (!teamGroup) {
      return res.status(404).json({ message: "Team group not found." });
    }

    // Add each employee to the team group

    // employee_ids: array of IDs to add
    const currentMembers = await teamGroup.getMembers({
      attributes: ["employee_id"],
      where: {
        employee_id: {
          [Op.in]: employee_ids,
        },
      },
    });
    const currentMemberIds = currentMembers.map((e) => e.employee_id);

    // Filter out IDs that are already members
    const uniqueIdsToAdd = employee_ids.filter(
      (id) => !currentMemberIds.includes(id)
    );

    if (uniqueIdsToAdd.length === 0) {
      return res
        .status(200)
        .json({ message: "All employees are already members." });
    }

    // Add only unique members
    await teamGroup.addMembers(uniqueIdsToAdd);

    return res.status(200).json({
      message: "Unique employees added to team group successfully.",
      added: uniqueIdsToAdd,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTeamGroupsMembers = async (req, res, next) => {
  const { team_group_id } = req.query;
  try {
    // Check if the team group exists
    const teamGroup = await TeamGroup.findOne({
      where: { group_id: team_group_id },
    });

    if (!teamGroup) {
      return res.status(404).json({ message: "Team group not found." });
    }

    // Get all members of the team group
    const members = await teamGroup.getMembers({
      attributes: ["employee_id", "name"],
    });

    return res.status(200).json({
      message: "Team group members retrieved successfully.",
      members,
    });
  } catch (error) {
    next(error);
  }
};

const removeEmployeeFromTeamGroup = async (req, res, next) => {
  const { team_group_id, employee_id } = req.body;
  try {
    // Fetch the TeamGroup instance
    const group_id = team_group_id;
    const teamGroup = await TeamGroup.findByPk(group_id);
    if (!teamGroup) {
      return res.status(404).json({ message: "Team group not found." });
    }

    // Fetch the Employee instance
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Remove the employee from the group
    await teamGroup.removeMember(employee);

    return res.status(200).json({
      message: "Team group member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeamGroup = async (req, res, next) => {
  const { team_group_id } = req.body;
  try {
    const group_id = team_group_id;
    const teamGroup = await TeamGroup.findByPk(group_id);
    if (!teamGroup) {
      return res.status(404).json({ message: "Team group not found." });
    }

    await teamGroup.destroy(teamGroup);

    return res.status(200).json({
      message: "Team group member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  editEmployee,
  deleteEmployee,
  getEmployeesWithNoEntry,
  setEmployeePosition,
  createTeamGroup,
  getAllTeamGroups,
  addEmployeeToTeamGroup,
  getAllTeamGroupsMembers,
  removeEmployeeFromTeamGroup,
  deleteTeamGroup,
};
