const { Timesheet, Project, Employee } = require("../models");
const {
  generateNewTimesheetExcel,
  generateTimesheetExcel,
} = require("../resources/timesheetCsv/timesheetCsv");

const { Op } = require("sequelize");

const getTimesheet = async (req, res) => {
  const { employee_id, project_id, start_date } = req.query;
  // Parse the start_date (assuming the start_date is in 'YYYY-MM-DD' format)
  const startOfWeek = new Date(start_date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (6 days after start date)

  let whereClause = project_id
    ? { employee_id: employee_id, project_id: project_id }
    : { employee_id };
  try {
    // Query timesheets for the given employee and project for all days in the week (start_date to end_date)
    const timesheets = await Timesheet.findAll({
      where: {
        ...whereClause,
        date: {
          [Op.gte]: startOfWeek.toISOString().split("T")[0], // Start of week
          [Op.lte]: endOfWeek.toISOString().split("T")[0], // End of week
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
    console.error("Error fetching timesheet data:", error);
    res.status(500).json({ error: "Failed to fetch timesheet data" });
  }
};

const getAllTimesheets = async (req, res) => {
  const {
    employee_id = [],
    project_id = [],
    start_date,
    page = 1,
    limit = 10,
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

    console.log(whereClause);
    // Query timesheets based on the provided filters
    const timesheets = await Timesheet.findAndCountAll({
      where: whereClause,
      include: [
        { model: Employee, as: "Employee", attributes: ["name"] },
        { model: Project, as: "Project", attributes: ["name"] },
      ],
      order: [["date", "ASC"]],
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

const setTimesheetRecord = async (req, res) => {
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
    res.status(500).json({ message: "Error saving timesheet data", error });
  }
};

const deleteTimesheetRecord = async (req, res) => {
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
    console.error("Error deleting timesheet:", error);
    return res.status(500).json({ error: "Failed to delete timesheet(s)" });
  }
};

const downloadTimesheetCsv = async (req, res) => {
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
      limit: parseInt(limit),
      offset: offset,
    });

    const csvObject =
      detailed === "true"
        ? await generateTimesheetExcel(timesheets.rows, start_date)
        : await generateNewTimesheetExcel(timesheets.rows);

    return res.status(200).json(csvObject);
  } catch (error) {
    console.error("Error fetching timesheet data:", error);
    res.status(500).json({ error: "Failed to fetch timesheet data" });
  }
};

module.exports = {
  getTimesheet,
  setTimesheetRecord,
  deleteTimesheetRecord,
  downloadTimesheetCsv,
  getAllTimesheets,
};
