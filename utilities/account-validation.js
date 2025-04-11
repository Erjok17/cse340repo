const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* *****************************
*   Registration Validation Rules
* *************************** */
validate.registrationRules = () => {
  return [
    // First name
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    
    // Last name
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    
    // Email
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await utilities.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
    
    // Password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character")
  ]
}

/* *****************************
*   Login Validation Rules
* *************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required"),
      
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A password is required")
  ]
}

/* *****************************
*   Check Registration Data
* *************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* *****************************
*   Check Login Data
* *************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email
    })
    return
  }
  next()
}

module.exports = validate