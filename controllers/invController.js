const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view by inventory ID
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    console.log("Fetching vehicle with ID:", invId);
    
    const vehicleData = await invModel.getVehicleDetailById(invId);
    console.log("Vehicle data received:", vehicleData);

    if (!vehicleData) {
      let nav = await utilities.getNav();
      return res.status(404).render("./inventory/detail", {
        title: "Vehicle Not Found",
        nav,
        detailHTML: '<p class="notice">Sorry, no matching vehicle could be found.</p>'
      });
    }

    const detailHTML = await utilities.buildVehicleDetailView(vehicleData);
    let nav = await utilities.getNav();

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detailHTML,
    });
  } catch (error) {
    console.error("Error in buildByInvId:", error);
    next(error);
  }
};

/* ***************************
 *  Test endpoint (optional - for debugging)
 * ************************** */
invCont.testDetail = async function (req, res) {
  const testData = await invModel.getVehicleDetailById(4);
  res.json(testData);
};

module.exports = invCont;