const favoritesModel = require('../models/favorites-model');
const utilities = require('../utilities');

async function saveFavorite(req, res) {
    try {
        console.log("Save favorite request body:", req.body); // Debug log
        
        const { inv_id } = req.body;
        const account_id = res.locals.accountData.account_id;
        
        const existing = await favoritesModel.checkFavorite(account_id, inv_id);
        
        if (existing) {
            await favoritesModel.removeFavorite(account_id, inv_id);
            req.flash("notice", "Removed from favorites");
        } else {
            await favoritesModel.addFavorite(account_id, inv_id);
            req.flash("notice", "Added to favorites");
        }
        
        // Redirect back to the vehicle detail page
        res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
        console.error("Favorite error:", error); // Detailed error logging
        req.flash("error", "Error updating favorites");
        res.redirect("/account/login");
    }
}
async function buildFavoritesView(req, res) {
    try {
        const account_id = res.locals.accountData.account_id;
        const favorites = await favoritesModel.getFavorites(account_id);
        
        res.render("account/favorites", {
            title: "My Favorites",
            nav: await utilities.getNav(),
            favorites: favorites.rows
        });
    } catch (error) {
        req.flash("error", "Error loading favorites");
        res.redirect("/account/login");
    }
}

module.exports = { saveFavorite, buildFavoritesView };