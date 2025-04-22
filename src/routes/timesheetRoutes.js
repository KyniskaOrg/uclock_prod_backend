const express = require("express");
const {
  getTimesheet,
  setTimesheetRecord,
  deleteTimesheetRecord,
  downloadTimesheetCsv,
  getAllTimesheets,
  getMonthTotalHours,
} = require("../controllers/timesheetController");
const { populateMonthTime } = require("../../seeders/MonthHourCalc");

const {
  validateGetTimesheet,
  validateSetTimesheetRecord,
  validateDeleteTimesheetRecord,
  validateGetTimesheetCsv,
  validateGetAllTimesheets,
  validateGetMonthTotalHours,
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.get("/getTimesheetRecord", validateGetTimesheet, getTimesheet); // Create project
router.get(
  "/getAllTimesheetRecords",
  validateGetAllTimesheets,
  getAllTimesheets
); // Create project

router.post(
  "/setTimesheetRecord",
  validateSetTimesheetRecord,
  setTimesheetRecord
); // Create project
router.post(
  "/deleteTimesheetRecord",
  validateDeleteTimesheetRecord,
  deleteTimesheetRecord
); // Create project

router.get(
  "/downloadTimesheetCsv",
  validateGetTimesheetCsv,
  downloadTimesheetCsv
); // Create project

router.get(
  "/getMonthTotalHours",
  validateGetMonthTotalHours,
  getMonthTotalHours
); // get Month total hours

router.get("/seedmonthlyTimesheet", populateMonthTime); // Create project

module.exports = router;
