const invModel = require("../models/inventory-model")
const Util = {}

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
 * Error handling middleware
 ************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util