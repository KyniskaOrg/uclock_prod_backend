const { body, query, validationResult } = require("express-validator");

// Helper function to check validation errors
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req); // Check for validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Return errors if validation fails
  }
  next(); // Continue to the next middleware/route handler if validation is successful
};

// Create reusable validation rules for different requests

// Register validation rules
const validateRegister = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("email")
    .isEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Za-z0-9]/)
    .withMessage("Password must contain both letters and numbers"),

  checkValidationErrors, // Check for errors after validation rules
];

// Login validation rules
const validateLogin = [
  body("email")
    .isEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  checkValidationErrors, // Check for errors after validation rules
];

// Login validation rules
const validateLoginEmployee = [
  body("email")
    .isEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  checkValidationErrors, // Check for errors after validation rules
];

// Employee creation validation rules
const validateCreateEmployee = [
  body("name")
    .notEmpty()
    .withMessage("Employee name is required")
    .isLength({ min: 3 })
    .withMessage("Employee name must be at least 3 characters long"),

  body("email")
    .isEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .optional()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("position").optional().isString().withMessage("Position is required"),

  checkValidationErrors, // Check for errors after validation rules
];

// Employee creation validation rules
const validateEditEmployee = [
  body("name")
    .notEmpty()
    .withMessage("Employee name is required")
    .isLength({ min: 3 })
    .withMessage("Employee name must be at least 3 characters long"),

  body("employee_id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .not()
    .optional(),

  checkValidationErrors, // Check for errors after validation rules
];

// Employee deletion validation rules
const validateDeleteEmployee = [
  body("employee_id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .not()
    .optional(),

  checkValidationErrors, // Check for errors after validation rules
];

const validateCreateProject = [
  body("projectName")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 3 })
    .withMessage("Project name must be at least 3 characters long"),

  body("clientId")
    .optional({ nullable: true }) // Make clientId optional
    .isInt({ min: 1 })
    .withMessage("Client ID must be a positive integer"),

  checkValidationErrors, // Middleware to check validation errors
];

const validateGetAllProjects = [
  // Validate pagination - page should be an integer, defaulting to 1
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .default(1),

  // Validate sortBy - should be one of the allowed fields
  query("sortBy")
    .optional()
    .isIn(["name", "client_id"])
    .withMessage('SortBy must be either "name" or "client_id"')
    .default("name"),

  // Validate sortOrder - should be either ASC or DESC
  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage('SortOrder must be either "ASC" or "DESC"')
    .default("ASC"),

  // Validate projectName - optional but if provided, should be a string
  query("searchText")
    .optional()
    .isString()
    .withMessage("Project name must be a string"),

  // Validate project limit
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Project Limit must be be 1-50"),

  // Check for validation errors
  checkValidationErrors,
];

const validateCreateClient = [
  body("clientName")
    .notEmpty()
    .withMessage("client name is required")
    .isLength({ min: 3 })
    .withMessage("client name must be at least 3 characters long"),

  checkValidationErrors, // Middleware to check validation errors
];

const validateGetAllClients = [
  // Validate pagination - page should be an integer, defaulting to 1
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .default(1),

  // Validate sortBy - should be one of the allowed fields
  query("sortBy")
    .optional()
    .isIn(["name", "client_id"])
    .withMessage('SortBy must be either "name" or "client_id"')
    .default("name"),

  // Validate sortOrder - should be either ASC or DESC
  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage('SortOrder must be either "ASC" or "DESC"')
    .default("ASC"),

  // Validate projectName - optional but if provided, should be a string
  query("searchText")
    .optional()
    .isString()
    .withMessage("Project name must be a string"),

  // Validate project limit
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Project Limit must be be 1-50"),

  // Check for validation errors
  checkValidationErrors,
];

const validateGetAllEmployees = [
  // Validate pagination - page should be an integer, defaulting to 1
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .default(1),

  // Validate sortBy - should be one of the allowed fields
  query("sortBy")
    .optional()
    .isIn(["name", "client_id"])
    .withMessage('SortBy must be either "name" or "client_id"')
    .default("name"),

  // Validate sortOrder - should be either ASC or DESC
  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage('SortOrder must be either "ASC" or "DESC"')
    .default("ASC"),

  // Validate projectName - optional but if provided, should be a string
  query("searchText")
    .optional()
    .isString()
    .withMessage("Project name must be a string"),

  // Validate project limit
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Project Limit must be be 1-50"),

  // Check for validation errors
  checkValidationErrors,
];

const validateSetTimesheetRecord = [
  // Validate employee_id
  body("employee_id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .not()
    .isEmpty()
    .withMessage("Employee ID is required"),

  // Validate project_id
  body("project_id")
    .isInt()
    .withMessage("Project ID must be an integer")
    .not()
    .isEmpty()
    .withMessage("Project ID is required"),

  // Validate date
  body("date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .not()
    .isEmpty()
    .withMessage("Date is required"),

  // Validate hours_worked
  body("hours_worked")
    .isString()
    .withMessage("Hours worked must be hhh:mm like formate")
    .not()
    .isEmpty()
    .withMessage("Hours worked is required"),

  body("work_type")
    .isIn(["night", "regular"])
    .withMessage('work_type must be either "night" or "regular"')
    .default("regular"),

  // Check for validation errors
  checkValidationErrors,
];
const validateGetTimesheet = [
  query("employee_id")
    .isInt()
    .withMessage("Employee ID must be an integer")
    .not()
    .isEmpty()
    .withMessage("Employee ID is required"),

  // Validate project_id
  query("project_id")
    .optional({ nullable: true }) // Make clientId optional
    .isInt()
    .withMessage("Project ID must be a positive integer"),

  // Validate week start date
  query("start_date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .not()
    .isEmpty()
    .withMessage("Date is required"),

  // Validate week start date
  query("end_date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .optional({ nullable: true }),

  // Check for validation errors
  checkValidationErrors,
];

const validateGetAllTimesheets = [
  // Validate pagination - page should be an integer, defaulting to 1
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .default(1),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Project Limit must be be 1-50"),
  query("employee_id")
    .isArray()
    .withMessage("Employee ID must be an integer")
    .not()
    .optional(),

  // Validate project_id
  query("project_id")
    .isArray()
    .withMessage("Project ID must be an integer")
    .not()
    .optional(),

  // Validate week start date
  query("start_date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .not()
    .isEmpty()
    .withMessage("Date is required"),

  query("end_date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .not()
    .isEmpty()
    .withMessage("end Date is required"),

  // Check for validation errors
  checkValidationErrors,
];

const validateDeleteTimesheetRecord = [
  // Ensure that timesheet_ids is an array
  body("timesheet_ids")
    .isArray({ min: 1 }) // Check that it's an array with at least one item
    .withMessage("Timesheet IDs are required as an array."),

  // Ensure each timesheet_id is an integer
  body("timesheet_ids.*")
    .isInt()
    .withMessage("Each timesheet ID must be an integer."),

  // Check for validation errors
  checkValidationErrors,
];

const validateGetTimesheetCsv = [
  // Validate pagination - page should be an integer, defaulting to 1
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .default(1),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Project Limit must be be 1-50"),
  query("employee_id")
    .isArray()
    .withMessage("Employee ID must be an integer")
    .not()
    .optional(),

  // Validate project_id
  query("project_id")
    .isArray()
    .withMessage("Project ID must be an integer")
    .not()
    .optional(),

  // Validate week start date
  query("start_date")
    .isISO8601()
    .withMessage("Date must be in the correct format (YYYY-MM-DD)")
    .not()
    .isEmpty()
    .withMessage("Date is required"),

  // Validate week start date
  query("detailed").isBoolean().withMessage("detailed must be a boolean"),
  // Check for validation errors
  checkValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateLoginEmployee,
  validateCreateProject,
  validateGetAllProjects,
  validateCreateClient,
  validateGetAllClients,
  validateCreateEmployee,
  validateEditEmployee,
  validateGetAllEmployees,
  validateGetTimesheet,
  validateGetAllTimesheets,
  validateSetTimesheetRecord,
  validateDeleteTimesheetRecord,
  validateGetTimesheetCsv,
  validateDeleteEmployee,
};
