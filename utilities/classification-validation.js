const { body, validationResult } = require("express-validator");
const validate = {};

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isAlphanumeric()
      .withMessage("Classification name must contain only letters and numbers")
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name")
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name
    });
  }
  next();
};

module.exports = validate;