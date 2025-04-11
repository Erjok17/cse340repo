const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

// GET route for "/account/login" (full path: "/account/login")
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// NEW registration route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Added this below existing routes
router.post(
  '/register',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);



module.exports = router;