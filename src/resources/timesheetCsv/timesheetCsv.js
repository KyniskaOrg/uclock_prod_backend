const xl = require("excel4node");
const fs = require("fs");
const path = require("path");
const { uploadFile } = require("../googleApi/googleApi");

const generateTimesheetExcel = async (timesheetData, start_date) => {
  // Create a new workbook and worksheet
  let wb = new xl.Workbook();
  let ws = wb.addWorksheet("Timesheet");

  const headerStyle = wb.createStyle({
    font: { bold: true, color: "black" },
    width: "200px",
  });
  // Define headers

  let days = [];
  for (let i = 0; i <= 6; i++) {
    let d = new Date(start_date);
    d.setDate(d.getDate() + i);
    const dateString = d.toISOString().split("T")[0];
    days.push(dateString);
  }

  let headers = ["Employee Name", "Project Name", ...days, "Total"];
  // Write headers
  headers.forEach((header, index) => {
    ws.cell(1, index + 1)
      .string(header)
      .style(headerStyle);
  });

  // Organize data by employee and project
  let groupedData = {};
  timesheetData.forEach((entry) => {
    let key = `${entry.Employee.name}||${entry.Project.name}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        "Employee Name": entry.Employee.name,
        "Project Name": entry.Project.name,
        "2025-01-27": "0:00",
        "2025-01-28": "0:00",
        "2025-01-29": "0:00",
        "2025-01-30": "0:00",
        "2025-01-31": "0:00",
        "2025-02-01": "0:00",
        "2025-02-02": "0:00",
      };
    }
    groupedData[key][entry.date] = entry.hours_worked;
  });

  // Function to calculate total hours
  function sumHours(hoursArray) {
    let totalMinutes = hoursArray.reduce((sum, time) => {
      let [h, m] = time.split(":").map(Number);
      return sum + h * 60 + m;
    }, 0);
    let totalHours = Math.floor(totalMinutes / 60);
    let totalMins = totalMinutes % 60;
    return `${totalHours}:${totalMins.toString().padStart(2, "0")}`;
  }

  // Write data
  let row = 2;
  Object.values(groupedData).forEach((data) => {
    let hoursArray = [
      data["2025-01-27"],
      data["2025-01-28"],
      data["2025-01-29"],
      data["2025-01-30"],
      data["2025-01-31"],
      data["2025-02-01"],
      data["2025-02-02"],
    ];
    data["Total"] = sumHours(hoursArray);

    ws.cell(row, 1).string(data["Employee Name"]);
    ws.cell(row, 2).string(data["Project Name"]);
    ws.cell(row, 3).string(data["2025-01-27"]);
    ws.cell(row, 4).string(data["2025-01-28"]);
    ws.cell(row, 5).string(data["2025-01-29"]);
    ws.cell(row, 6).string(data["2025-01-30"]);
    ws.cell(row, 7).string(data["2025-01-31"]);
    ws.cell(row, 8).string(data["2025-02-01"]);
    ws.cell(row, 9).string(data["2025-02-02"]);
    ws.cell(row, 10).string(data["Total"]);
    row++;
  });

  // Save file
  const filePath = path.join(__dirname, "Timesheet.xlsx");
  return new Promise((resolve, reject) => {
    // Save file
    wb.write(filePath, async (err) => {
      if (err) {
        reject(err);
      } else {
        // Upload file to Google Drive
        try {
          const result = await uploadFile(filePath);
          if (result) {
            resolve(result); // Return upload result instead of file path
          } else {
            reject("File upload failed");
          }
        } catch (uploadError) {
          reject(uploadError);
        }
      }
    });
  });
};

const generateNewTimesheetExcel = async (timesheetData) => {
  // Create a new workbook and worksheet
  let wb = new xl.Workbook();
  let ws = wb.addWorksheet("Timesheet");

  // Define headers
  let headers = [
    "Project",
    "Employee",
    "Date",
    "Time(h)",
    "Time(Decimal)",
    "Regular/Night",
  ];

  // Write headers
  const headerStyle = wb.createStyle({ font: { bold: true, color: "black" } });
  headers.forEach((header, index) => {
    ws.cell(1, index + 1)
      .string(header)
      .style(headerStyle);
  });
  ws.column(1).setWidth(20);
  // Organize data by employee and project
  let groupedData = [];
  timesheetData.forEach((entry) => {
    groupedData.push({
      Project: entry.Project?.name || "N/A",
      Employee: entry.Employee?.name || "N/A",
      Date: entry.date,
      "Time(h)": entry.hours_worked,
      "Time(Decimal)": timeToDecimal(entry.hours_worked),
      "Regular/Night": entry.work_type,
    });
  });

  function timeToDecimal(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return Number((hours + minutes / 60).toFixed(2));
  }

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Write data
  let row = 2;
  Object.values(groupedData).forEach((data) => {
    const formattedDate = formatDate(new Date(data["Date"]));
    ws.cell(row, 1).string(data["Project"]).style(headerStyle);
    ws.cell(row, 2).string(data["Employee"]);
    ws.cell(row, 3).string(formattedDate);
    ws.cell(row, 4).string(data["Time(h)"]);
    ws.cell(row, 5).number(data["Time(Decimal)"]);
    ws.cell(row, 6).string(data["Regular/Night"]);

    row++;
  });

  // Save file
  const filePath = path.join(__dirname, "Timesheet.xlsx");

  return new Promise((resolve, reject) => {
    // Save file
    wb.write(filePath, async (err) => {
      if (err) {
        reject(err);
      } else {
        // Upload file to Google Drive
        try {
          const result = await uploadFile(filePath);
          if (result) {
            resolve(result); // Return upload result instead of file path
          } else {
            reject("File upload failed");
          }
        } catch (uploadError) {
          reject(uploadError);
        }
      }
    });
  });
};

module.exports = { generateTimesheetExcel, generateNewTimesheetExcel };
