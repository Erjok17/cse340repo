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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id);
    let nav = await utilities.getNav();
    
    // Get inventory item data
    const itemData = await invModel.getInventoryById(inv_id);
    
    // Get classification list with current classification selected
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    
    // Combine make and model for display
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
};



/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
  } = req.body;

  const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
  );

  if (updateResult) {
      const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
  } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("error", "Sorry, the update failed.");
      res.status(501).render("inventory/edit-inventory", {
          title: "Edit " + itemName,
          nav,
          classificationSelect,
          errors: null,
          inv_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color,
          classification_id
      });
  }
};


/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirm = async (req, res) => {
  try {
    const inv_id = parseInt(req.params.inv_id);
    // Changed from req.models.inventory to direct invModel usage
    const itemData = await invModel.getInventoryById(inv_id);
    
    if (!itemData) {
      req.flash('error', 'Vehicle not found');
      return res.redirect('/inv/');
    }

    res.render('inventory/delete-confirm', {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      nav: await utilities.getNav(),
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    console.error('Delete confirm error:', error);
    req.flash('error', 'Error loading delete confirmation');
    res.redirect('/inv/');
  }
};

/* ***************************
 *  Process Inventory Deletion
 * ************************** */
invCont.deleteInventory = async (req, res) => {
  try {
    const inv_id = parseInt(req.body.inv_id);
    if (!inv_id) throw new Error('Invalid inventory ID');

    // Changed from req.models.inventory to direct invModel usage
    const result = await invModel.deleteInventoryItem(inv_id);
    
    if (result.rowCount > 0) {
      req.flash('notice', 'Vehicle deleted successfully');
    } else {
      req.flash('error', 'Vehicle not found');
    }
    res.redirect('/inv/');
  } catch (error) {
    console.error('Delete error:', error);
    req.flash('error', 'Deletion failed');
    res.redirect(`/inv/delete/${req.body.inv_id}`);
  }
};

module.exports = invCont;