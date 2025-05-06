const { Timesheet, MonthTime, Project, Employee } = require("../models");
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
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Use setUTCDate to avoid DST shifts
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
    let timesheet = await Timesheet.findOne({
      where: {
        employee_id,
        project_id,
        date,
      },
    });

    if (timesheet) {
      // If timesheet entry exists, update it
      const oldHours = timeStringToFloat(timesheet.hours_worked || "00:00");
      const newHours = timeStringToFloat(hours_worked);
      timesheet.hours_worked = hours_worked;
      timesheet.work_type = work_type;

      await updateMonthTime({ employee_id, oldHours, newHours, date });

      await timesheet.save();
    } else {
      // If no entry exists, create a new one
      timesheet = await Timesheet.create({
        employee_id,
        project_id,
        date,
        hours_worked,
        work_type,
      });
      const newHours = timeStringToFloat(hours_worked);
      await updateMonthTime({
        employee_id,
        oldHours: 0,
        newHours,
        date,
      });
    }

    res
      .status(200)
      .json({ message: "Timesheet updated successfully", data: timesheet });
  } catch (error) {
    next(error);
  }
};

// Convert "HH:MM" to float hours for calculations
const timeStringToFloat = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
};

// Convert float hours back to "HH:MM"
const floatToTimeString = (floatHours) => {
  const hours = Math.floor(floatHours);
  const minutes = Math.round((floatHours - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const updateMonthTime = async ({ employee_id, oldHours, newHours, date }) => {
  console.log(employee_id, oldHours, newHours, date);
  const monthKey = `${new Date(date).getFullYear()}-${String(
    new Date(date).getMonth() + 1
  ).padStart(2, "0")}-01`;

  let monthTime = await MonthTime.findOne({
    where: {
      employee_id,
      date: monthKey,
    },
  });

  if (monthTime) {
    // Update the month timesheet
    const updatedHours = floatToTimeString(
      timeStringToFloat(monthTime.hours_worked) - oldHours + newHours
    );

    // Update the month timesheet entry
    monthTime.hours_worked = updatedHours;
    await monthTime.save();
  } else {
    // Create a new month timesheet entry
    await MonthTime.create({
      employee_id,
      date: monthKey,
      hours_worked: floatToTimeString(newHours),
    });
  }
};

const deleteTimesheetRecord = async (req, res, next) => {
  const { timesheet_ids } = req.body;
  try {
    // Fetch the timesheets to be deleted
    const timesheets = await Timesheet.findAll({
      where: {
        timesheet_id: {
          [Op.in]: timesheet_ids, // Use Sequelize's Op.in to match multiple IDs
        },
      },
    });

    if (!timesheets.length) {
      return res
        .status(404)
        .json({ error: "No timesheets found for the given ID(s)." });
    }

    // Group timesheets by employee and month
    const monthUpdates = {};
    timesheets.forEach((timesheet) => {
      const { employee_id, date, hours_worked } = timesheet.dataValues;
      const monthKey = `${new Date(date).getFullYear()}-${String(
        new Date(date).getMonth() + 1
      ).padStart(2, "0")}-01`;

      if (!monthUpdates[monthKey]) {
        monthUpdates[monthKey] = {};
      }

      if (!monthUpdates[monthKey][employee_id]) {
        monthUpdates[monthKey][employee_id] = 0;
      }

      // Convert "HH:MM" to float and accumulate hours
      monthUpdates[monthKey][employee_id] += timeStringToFloat(hours_worked);
    });

    // Update the MonthTime table
    for (const [monthKey, employees] of Object.entries(monthUpdates)) {
      for (const [employee_id, totalHours] of Object.entries(employees)) {
        const monthTime = await MonthTime.findOne({
          where: {
            employee_id,
            date: monthKey,
          },
        });

        if (monthTime) {
          // Subtract the deleted hours from the month total
          const updatedHours = floatToTimeString(
            timeStringToFloat(monthTime.hours_worked) - totalHours
          );
          monthTime.hours_worked = updatedHours;
          await monthTime.save();
        }
      }
    }

    await Timesheet.destroy({
      where: {
        timesheet_id: {
          [Op.in]: timesheet_ids,
        },
      },
    });

    return res.status(200).json({
      message: `timesheet(s) deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

const downloadTimesheetCsv = async (req, res, next) => {
  const { employee_id = [], project_id = [], start_date, end_date } = req.query;

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

    // Query timesheets based on the provided filters
    const timesheets = await Timesheet.findAndCountAll({
      where: whereClause,
      include: [
        { model: Employee, as: "Employee", attributes: ["name"] },
        { model: Project, as: "Project", attributes: ["name"] },
      ],
    });

    const csvObject = await generateNewTimesheetExcel(timesheets.rows);

    return res.status(200).json(csvObject);
  } catch (error) {
    next(error);
  }
};

const getMonthTotalHours = async (req, res, next) => {
  const {
    employee_id = [],
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

    // Validate sortOrder
    const validSortOrders = ["ASC", "DESC"];
    const orderDirection = validSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : "ASC";

    // Determine sorting field
    let order = [["date", orderDirection]]; // Default sorting by date

    if (sortBy === "name") {
      order = [[{ model: Employee, as: "Employee" }, "name", orderDirection]];
    } else if (sortBy === "hours_worked" || sortBy === "hours_worked_decimal") {
      order = [["hours_worked", orderDirection]];
    }

    // Calculate pagination values
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query timesheets based on the provided filters
    // console.log(whereClause)
    const monthTime = await MonthTime.findAndCountAll({
      where: whereClause,
      include: [{ model: Employee, as: "Employee", attributes: ["name"] }],
      order, // Apply dynamic sorting
      limit: parseInt(limit),
      offset: offset,
    });

    return res.status(200).json({
      totalRecords: monthTime.count,
      totalPages: Math.ceil(monthTime.count / limit),
      currentPage: parseInt(page),
      monthTime: monthTime.rows,
    });
  } catch (error) {
    console.error("Error fetching monthTime data:", error);
    res.status(500).json({ error: "Failed to fetch monthTime data" });
  }
};

module.exports = {
  getTimesheet,
  setTimesheetRecord,
  deleteTimesheetRecord,
  downloadTimesheetCsv,
  getAllTimesheets,
  getMonthTotalHours,
};
