// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classificationValidate = require("../utilities/classification-validation")
const inventoryValidate = require("../utilities/inventory-validation")

// Routes
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
router.get("/", utilities.handleErrors(invController.buildManagementView));

// New classification routes
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  classificationValidate.classificationRules(),
  classificationValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// New inventory routes
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  inventoryValidate.inventoryRules(),
  inventoryValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;