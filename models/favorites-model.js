const pool = require('../database/');

async function addFavorite(account_id, inv_id) {
    try {
        const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *";
        return await pool.query(sql, [account_id, inv_id]);
    } catch (error) {
        console.error("Add favorite error:", error);
        return null;
    }
}

async function removeFavorite(account_id, inv_id) {
    try {
        const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *";
        return await pool.query(sql, [account_id, inv_id]);
    } catch (error) {
        console.error("Remove favorite error:", error);
        return null;
    }
}

async function getFavorites(account_id) {
    try {
        const sql = `
            SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, 
                   i.inv_price, i.inv_thumbnail, i.inv_description
            FROM favorites f
            JOIN inventory i ON f.inv_id = i.inv_id
            WHERE f.account_id = $1
            ORDER BY f.date_added DESC`;
        return await pool.query(sql, [account_id]);
    } catch (error) {
        console.error("Get favorites error:", error);
        return null;
    }
}

async function checkFavorite(account_id, inv_id) {
    try {
        const sql = "SELECT * FROM favorites WHERE account_id = $1 AND inv_id = $2";
        const result = await pool.query(sql, [account_id, inv_id]);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Check favorite error:", error);
        return false;
    }
}

module.exports = { addFavorite, removeFavorite, getFavorites, checkFavorite };