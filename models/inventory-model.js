const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
}

/* ***************************
 *  Get vehicle details by inventory ID
 * ************************** */
async function getVehicleDetailById(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
       WHERE inv_id = $1`,
      [invId]
    );
    return data.rows[0]; // Return just the first row (single vehicle)
  } catch (error) {
    console.error("getVehicleDetailById error: " + error);
    return null; // Return null if there's an error
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("ADD CLASSIFICATION ERROR:", error);
    return null;
  }
}

/* ***************************
 *  Add new inventory
 * ************************** */
async function addInventory(invData) {
  try {
    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_miles, 
      inv_color, classification_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    
    return await pool.query(sql, [
      invData.inv_make,
      invData.inv_model,
      invData.inv_year,
      invData.inv_description,
      invData.inv_image,
      invData.inv_thumbnail,
      invData.inv_price,
      invData.inv_miles,
      invData.inv_color,
      invData.classification_id
    ]);
  } catch (error) {
    console.error("ADD INVENTORY ERROR:", error);
    return null;
  }
}

// Export all functions
module.exports = { 
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleDetailById,
  addClassification,
  addInventory 
};