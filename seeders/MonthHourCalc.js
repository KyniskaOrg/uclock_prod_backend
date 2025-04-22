const { Op } = require("sequelize");
const { Timesheet, MonthTime, Employee } = require("../src/models");

// Convert "hh:mm" to float hours (e.g., "02:30" => 2.5)
function timeStringToFloat(timeStr) {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return 0;

  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;

  return hours + minutes / 60;
}

// Convert float hours to "hh:mm" (e.g., 2.5 => "02:30")
function floatToTimeString(floatHours) {
  const hours = Math.floor(floatHours);
  const minutes = Math.round((floatHours - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

async function populateMonthTime() {
  console.log("🚀 Starting MonthTime population...");

  try {
    const employees = await Employee.findAll({ attributes: ["employee_id"] });
    console.log(`👥 Found ${employees.length} employees.`);

    for (const [index, employee] of employees.entries()) {
      console.log(employee);
      const employeeId = employee.employee_id;
      console.log(
        `\n🔄 Processing employee ${index + 1}/${
          employees.length
        } (ID: ${employeeId})...`
      );

      const timesheets = await Timesheet.findAll({
        where: {
          employee_id: employeeId,
          hours_worked: {
            [Op.and]: [
              { [Op.not]: null },
              { [Op.notILike]: "%nan:nan%" },
              { [Op.regexp]: "^\\d{1,2}:\\d{2}$" },
            ],
          },
        },
        raw: true,
      });

      console.log(`📄 Found ${timesheets.length} valid timesheets.`);

      const monthlyTotals = {};

      for (const entry of timesheets) {
        const date = new Date(entry.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const hours = timeStringToFloat(entry.hours_worked);

        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = 0;
        }

        monthlyTotals[monthKey] += hours;
      }

      const monthKeys = Object.keys(monthlyTotals);
      console.log(`📆 Aggregated data for ${monthKeys.length} months.`);

      for (const [month, totalHours] of Object.entries(monthlyTotals)) {
        const timeInHHMM = floatToTimeString(totalHours);

        await MonthTime.create({
          date: `${month}-01`,
          hours_worked: timeInHHMM,
          employee_id: employeeId,
        });

        console.log(`✅ Saved ${timeInHHMM} hours for ${month}.`);
      }
    }
  } catch (error) {
    console.error("❌ Error during MonthTime population:", error.message);
  }

  console.log("\n🎉 MonthTime table population complete!");
}

module.exports = { populateMonthTime };
