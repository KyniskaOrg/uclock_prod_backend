const express = require("express");
const {
  getTimesheet,
  setTimesheetRecord,
  deleteTimesheetRecord,
  downloadTimesheetCsv,
  getAllTimesheets
} = require("../controllers/timesheetController");
//const {seedTimesheets} = require('../../seeders/timeSheetSeed');

const {
  validateGetTimesheet,
  validateSetTimesheetRecord,
  validateDeleteTimesheetRecord,
  validateGetTimesheetCsv,
  validateGetAllTimesheets
} = require("../middlewares/bodyValidator");

const router = express.Router();

router.get("/getTimesheetRecord", validateGetTimesheet, getTimesheet); // Create project
router.get("/getAllTimesheetRecords", validateGetAllTimesheets, getAllTimesheets); // Create project

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

// router.get(
//   "/seed",
//   seedTimesheets
// ); // Create project

module.exports = router;
