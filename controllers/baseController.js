const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res, next) {
    try {
      const nav = await utilities.getNav();
      res.render("index", { 
        title: "Home", 
        nav 
      });
    } catch (error) {
      // This ensures errors are passed to your Express error handler
      next(error); 
    }
  };
module.exports = baseController
