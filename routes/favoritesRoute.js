const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const utilities = require("../utilities");

router.post("/save", 
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.saveFavorite)
);

router.get("/", 
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.buildFavoritesView)
);


router.post("/save", 
    express.urlencoded({ extended: true }), // This parses form submissions
    utilities.checkLogin,
    utilities.handleErrors(favoritesController.saveFavorite)
  );

module.exports = router;