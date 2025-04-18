const utilities = require('../utilities');
const { body, validationResult } = require("express-validator");
const validate = {};

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required"),
    
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters"),
      
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
      
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Year must be valid"),
      
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number")
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    });
  }
  next();
};

/* ***************************
 * Check Update Data
 * Redirects to edit view if errors
 * ************************** */
const checkUpdateData = async (req, res, next) => {
    const { 
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
    } = req.body;

    let errors = [];
    errors = validationResult(req).array();

    if (errors.length > 0) {
        let nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        
        res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            errors,
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
        return;
    }
    next();
};

module.exports = validate;