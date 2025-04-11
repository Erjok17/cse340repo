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
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add new classification
 * ************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  
  const regResult = await invModel.addClassification(classification_name);
  
  if (regResult) {
    req.flash("notice", `The ${classification_name} classification was successfully added.`);
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: await utilities.getNav(), // Refresh nav with new classification
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the classification addition failed.");
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    });
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  });
};

/* ***************************
 *  Add new inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail, inv_price,
    inv_miles, inv_color
  } = req.body;
  
  const invResult = await invModel.addInventory({
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail, inv_price,
    inv_miles, inv_color
  });
  
  if (invResult) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`);
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the vehicle addition failed.");
    let classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
      ...req.body
    });
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