const cron = require("node-cron");
const { enqueueMessageJobs } = require("../queues");
const { Op } = require("sequelize");
const { sequelize, Employee } = require("../models");
const { messageQueue } = require("../queues/messageQueue.js");

const getEmployeesWithNoTimesheet = async () => {
  try {
    const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JavaScript
    const currentYear = new Date().getFullYear();

    // Find employees with no timesheet for the current month
    const employees = await Employee.findAll({
      attributes: ["name", "employee_id", "phone"],
      where: {
        [Op.and]: [
          // A. Subquery NOT EXISTS
          sequelize.literal(`
        NOT EXISTS (
          SELECT 1 FROM "Timesheets" t
          WHERE t."employee_id" = "Employee"."employee_id"
          AND t."date" >= '${`1/${currentMonth}/${currentYear}`}'
          AND t."date" < '${`1/${currentMonth + 1}/${currentYear}`}'
        )
      `),
          // B. Phone validation
          {
            phone: {
              [Op.and]: [{ [Op.ne]: "" }, { [Op.not]: null }],
            },
          },
        ],
      },
    });
    return employees;
  } catch (error) {
    console.log("Error fetching employees with no timesheet:", error);
  }
};

// schedule it on startup
function startMessageScheduler() {
  getEmployeesWithNoTimesheet().then((employees) => {
    if (employees.length === 0) {
      return;
    }
    const phones = employees.map((employee) => employee.phone);
    if (phones.length === 0) {
      console.log("No phone numbers found for employees with no timesheet.");
      return;
    }
    phones.forEach((phoneNumber) => {
      enqueueMessageJobs(phoneNumber);
    });
  });
}

module.exports = { startMessageScheduler };
