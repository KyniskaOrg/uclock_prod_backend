const { Timesheet, Project, Employee } = require("../models");
const {
  generateNewTimesheetExcel,
  generateTimesheetExcel,
} = require("../resources/timesheetCsv/timesheetCsv");

const { Op } = require("sequelize");

const getTimesheet = async (req, res, next) => {
  const { employee_id, project_id, start_date, end_date } = req.query;

  // Parse the start_date
  const startOfWeek = new Date(start_date);

  // Use provided end_date or calculate a default one (6 days from start_date)
  const endOfWeek = end_date ? new Date(end_date) : new Date(startOfWeek);
  if (!end_date) {
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  }

  let whereClause = project_id
    ? { employee_id: employee_id, project_id: project_id }
    : { employee_id };
  try {
    // Query timesheets for the given employee and project within the date range
    const timesheets = await Timesheet.findAll({
      where: {
        ...whereClause,
        date: {
          [Op.gte]: startOfWeek.toISOString().split("T")[0], // Start date
          [Op.lte]: endOfWeek.toISOString().split("T")[0], // End date (provided or calculated)
        },
      },
      include: [
        { model: Employee, as: "Employee", attributes: ["name"] },
        { model: Project, as: "Project", attributes: ["name"] },
      ],
      order: [["date", "ASC"]],
    });
    // Return the result
    return res.status(200).json(timesheets);
  } catch (error) {
    next(error);
  }
};

const getAllTimesheets = async (req, res, next) => {
  const {
    employee_id = [],
    project_id = [],
    start_date,
    end_date,
    page = 1,
    limit = 10,
    sortBy = "date",
    sortOrder = "ASC",
  } = req.query;

  // Parse the start_date (assuming the start_date is in 'YYYY-MM-DD' format)
  const startOfMonth = new Date(start_date);
  const endOfMonth = new Date(end_date);

  try {
    // Construct where clause dynamically
    const whereClause = {
      date: {
        [Op.gte]: startOfMonth.toISOString().split("T")[0],
        [Op.lte]: endOfMonth.toISOString().split("T")[0],
      },
    };

    if (employee_id.length) {
      whereClause.employee_id = employee_id;
    }
    if (project_id.length) {
      whereClause.project_id = project_id;
    }

    // Validate sortOrder
    const validSortOrders = ["ASC", "DESC"];
    const orderDirection = validSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "ASC";

    // Determine sorting field
    let order = [["date", orderDirection]]; // Default sorting by date

    if (sortBy === "name") {
      order = [[{ model: Employee, as: "Employee" }, "name", orderDirection]];
    } else if (sortBy === "projectName") {
      order = [[{ model: Project, as: "Project" }, "name", orderDirection]];
    }

    // Calculate pagination values
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query timesheets based on the provided filters
    const timesheets = await Timesheet.findAndCountAll({
      where: whereClause,
      include: [
        { model: Employee, as: "Employee", attributes: ["name"] },
        { model: Project, as: "Project", attributes: ["name"] },
      ],
      order, // Apply dynamic sorting
      limit: parseInt(limit),
      offset: offset,
    });

    return res.status(200).json({
      totalRecords: timesheets.count,
      totalPages: Math.ceil(timesheets.count / limit),
      currentPage: parseInt(page),
      timesheets: timesheets.rows,
    });
  } catch (error) {
    console.error("Error fetching timesheet data:", error);
    res.status(500).json({ error: "Failed to fetch timesheet data" });
  }
};

const setTimesheetRecord = async (req, res, next) => {
  const { employee_id, project_id, date, hours_worked, work_type } = req.body;

  try {
    const existingTimesheet = await Timesheet.findOne({
      where: {
        employee_id,
        project_id,
        date,
      },
    });

    if (existingTimesheet) {
      // If timesheet entry exists, update it
      existingTimesheet.hours_worked = hours_worked;
      existingTimesheet.work_type = work_type;
      await existingTimesheet.save();
    } else {
      // If no entry exists, create a new one
      await Timesheet.create({
        employee_id,
        project_id,
        date,
        hours_worked,
        work_type,
      });
    }

    res.status(200).json({ message: "Timesheet updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteTimesheetRecord = async (req, res, next) => {
  const { timesheet_ids } = req.body;

  try {
    // Delete timesheets by ID(s)
    const deletedRows = await Timesheet.destroy({
      where: {
        timesheet_id: {
          [Op.in]: timesheet_ids, // Use Sequelize's Op.in to match multiple IDs
        },
      },
    });

    if (deletedRows === 0) {
      return res
        .status(404)
        .json({ error: "No timesheets found for the given ID(s)." });
    }

    return res.status(200).json({
      message: `timesheet(s) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

const downloadTimesheetCsv = async (req, res, next) => {
  const {
    employee_id = [],
    project_id = [],
    start_date,
    page = 1,
    limit = 10,
    detailed,
  } = req.query;

  // Parse the start_date (assuming the start_date is in 'YYYY-MM-DD' format)
  const startOfMonth = new Date(start_date);
  startOfMonth.setDate(1); // Start of the month

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);
  endOfMonth.setDate(0); // Last day of the month

  try {
    // Construct where clause dynamically
    const whereClause = {
      date: {
        [Op.gte]: startOfMonth.toISOString().split("T")[0],
        [Op.lte]: endOfMonth.toISOString().split("T")[0],
      },
    };

    if (employee_id.length) {
      whereClause.employee_id = employee_id;
    }
    if (project_id.length) {
      whereClause.project_id = project_id;
    }

    // Calculate pagination values
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query timesheets based on the provided filters
    const timesheets = await Timesheet.findAndCountAll({
      where: whereClause,
      include: [
        { model: Employee, as: "Employee", attributes: ["name"] },
        { model: Project, as: "Project", attributes: ["name"] },
      ],
      order: [["date", "ASC"]],
    });

    const csvObject =
      detailed === "true"
        ? await generateTimesheetExcel(timesheets.rows, start_date)
        : await generateNewTimesheetExcel(timesheets.rows);

    return res.status(200).json(csvObject);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimesheet,
  setTimesheetRecord,
  deleteTimesheetRecord,
  downloadTimesheetCsv,
  getAllTimesheets,
};
