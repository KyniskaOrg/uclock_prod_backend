// const { Employee, Project, Timesheet } = require("../src/models"); // Adjust the path as needed
// const fs = require("fs");
// const path = require("path");
// // will be run as an api /api/timesheet/seed

// const seedTimesheets = async () => {
//   const timesheetData = JSON.parse(
//     fs.readFileSync(path.join(__dirname, "./timesheet.json"), "utf-8")
//   );

//   try {
//     for (const entry of timesheetData) {
//       // Find the employee and project
//       const employee = await Employee.findOne({
//         where: { name: entry.employee },
//       });
//       const project = await Project.findOne({ where: { name: entry.project } });

//       if (!employee || !project) {
//         console.error(
//           `Skipping entry: Employee or Project not found for ${entry.employee} - ${entry.project}`
//         );
//         continue; // Skip if either is missing
//       }

//       // Convert date format to YYYY-MM-DD (for PostgreSQL)
//       const formattedDate = entry.date.split("/").reverse().join("-");

//       // Create the timesheet entry
//       await Timesheet.create({
//         employee_id: employee.employee_id,
//         project_id: project.project_id,
//         date: formattedDate,
//         hours_worked: entry.hours_worked,
//       });
// console.log("________________________________________")
//       console.log(
//         `Inserted timesheet for ${entry.employee} in project ${entry.project}`
//       );
// console.log("________________________________________")

//     }
//   } catch (error) {
//     console.error("Error seeding timesheets:", error);
//   }
// };

// module.exports = { seedTimesheets };
