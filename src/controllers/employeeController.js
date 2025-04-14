const { Op } = require("sequelize");
const { Employee, Timesheet, sequelize } = require("../models");

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
      { where: { employee_id: employee_ids} },
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

module.exports = {
  createEmployee,
  getAllEmployees,
  editEmployee,
  deleteEmployee,
};
