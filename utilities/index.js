const invModel = require("../models/inventory-model")
const { pool } = require("../database/") // Add this line to access the database pool
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML
 ************************** */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let nav = '<ul><li><a href="/" title="Home">Home</a></li>'
  
  data.rows.forEach(row => {
    nav += `<li><a href="/inv/type/${row.classification_id}" title="${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  
  return nav + '</ul>'
}

/* **************************************
 * Build classification grid HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data) {
  if (!data.length) {
    return '<p class="notice">No vehicles found</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach(vehicle => {
    grid += `
    <li>
      <a href="/inv/detail/${vehicle.inv_id}" title="${vehicle.inv_make} ${vehicle.inv_model} details">
        <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      </a>
      <div class="namePrice">
        <hr />
        <h2>
          <a href="/inv/detail/${vehicle.inv_id}" title="${vehicle.inv_make} ${vehicle.inv_model} details">
            ${vehicle.inv_make} ${vehicle.inv_model}
          </a>
        </h2>
        <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
      </div>
    </li>`
  })
  return grid + '</ul>'
}

/* **************************************
 * Build classification dropdown list HTML
 * ************************************ */
Util.buildClassificationList = async function(classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += '<option value="">Choose a Classification</option>';
  
  data.rows.forEach(row => {
    classificationList += `<option value="${row.classification_id}"`;
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });
  
  classificationList += '</select>';
  return classificationList;
}

/* **************************************
 * Build ONLY vehicle content HTML
 * (No layout/header/footer)
 * ************************************ */
Util.buildVehicleDetailView = function(vehicle) {
  // Ensure proper image path
  const imagePath = vehicle.inv_image.startsWith('/images/') 
    ? vehicle.inv_image 
    : `/images/vehicles/${vehicle.inv_image}`

  return `
  <section class="vehicle-content">
    <div class="vehicle-media">
      <img src="${imagePath}" alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}">
    </div>
    <div class="vehicle-specs">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <div class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</div>
      <div class="spec-grid">
        <div><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</div>
        <div><strong>Color:</strong> ${vehicle.inv_color}</div>
      </div>
      <div class="description">${vehicle.inv_description}</div>
    </div>
  </section>`
}

/* ************************
 * Check if email exists in DB
 ************************** */
Util.checkExistingEmail = async function(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount > 0
  } catch (error) {
    console.error("checkExistingEmail error: " + error)
    return false // Return false if there's an error to fail safely
  }
}

/* ************************
 * Error handling middleware
 ************************** */
// Add proper error handling wrapper
Util.handleErrors = (fn) => {
  console.log('Wrapper received:', typeof fn, fn); // Add this
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Error in route handler:', error);
      next(error);
    }
  };
};



/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
*  Check Account Access (verify user owns the account)
* *************************************** */
Util.checkAccountAccess = async (req, res, next) => {
  const requestedAccountId = parseInt(req.params.account_id);
  const userAccountId = res.locals.accountData?.account_id;
  
  if (requestedAccountId !== userAccountId) {
    req.flash("notice", "You can only update your own account.");
    return res.redirect("/account/");
  }
  next();
};
module.exports = Util