const utilities = require("../utilities");
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const classificationValidate = require("../utilities/classification-validation");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
 * Deliver Login View
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 * Deliver Registration View
 * *************************************** */
async function buildRegister(req, res, next) {  // THIS FUNCTION MUST EXIST
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword // Use the hashed password here
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


// Add these new functions to your existing controller:

/* ****************************************
*  Deliver Account Update View
* *************************************** */
async function buildUpdateView(req, res) {
  try {
    let nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id);
    
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account: accountData // Changed to pass as single object
    });
  } catch (error) {
    console.error("buildUpdateView error:", error);
    req.flash("notice", "Sorry, the server encountered an error.");
    res.redirect("/account/");
  }
}
/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res) {
  try {
    let nav = await utilities.getNav();
    const account_id = parseInt(req.params.account_id);
    const { account_firstname, account_lastname, account_email } = req.body;

    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Refresh account data in JWT
      const accountData = await accountModel.getAccountById(account_id);
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      
      res.cookie("jwt", accessToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 3600 * 1000 
      });
      
      req.flash("notice", "Your account was successfully updated.");
      return res.redirect("/account/");
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.error("updateAccount error:", error);
    req.flash("notice", "Sorry, the update failed.");
    return res.redirect(`/account/update/${req.params.account_id}`);
  }
}

/* ****************************************
*  Process Password Change
* *************************************** */
async function updatePassword(req, res) {
  try {
    const account_id = parseInt(req.params.account_id);
    const { account_password } = req.body;

    let hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Your password was successfully updated.");
    } else {
      throw new Error("Password update failed");
    }
  } catch (error) {
    console.error("updatePassword error:", error);
    req.flash("notice", "Sorry, the password update failed.");
  }
  return res.redirect(`/account/update/${req.params.account_id}`);
}
/* ****************************************
*  Process Logout
* *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

/* ****************************************
*  Enhanced Account Management View
* *************************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  
  const viewData = {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_type: accountData.account_type
  };

  // Add inventory management link for Employees/Admins
  if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
    viewData.inventoryManagement = true;
  }

  res.render("account/accountManagement", viewData);
}

// Update module.exports to include new functions
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateView,
  updateAccount,
  updatePassword,
  logout
};
