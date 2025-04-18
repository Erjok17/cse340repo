const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

// GET route for "/account/login" (full path: "/account/login")
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// NEW registration route
router.get("/register", utilities.handleErrors(accountController.buildRegister));



router.get(
  "/",
  utilities.handleErrors(accountController.buildAccountManagement)
);
// Added this below existing routes
router.post(
  '/register',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;