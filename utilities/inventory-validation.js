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

module.exports = validate;