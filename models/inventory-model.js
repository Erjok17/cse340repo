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
/* ***************************
 *  Get Inventory by ID
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    
    if (data.rows.length === 0) {
      console.log(`No vehicle found with ID: ${inv_id}`); // Debug log
      return null;
    }
    
    return data.rows[0];
  } catch (error) {
    console.error('Error in getInventoryById:', error);
    throw error; // Re-throw to be caught by controller
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


/* ***************************
 * Get inventory item by ID
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `SELECT * FROM inventory WHERE inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Error fetching inventory by ID", error);
    return null;
  }
}

/* ***************************
 * Update inventory item
 * ************************** */ 
async function updateInventory(
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
) {
  try {
      const sql = `
          UPDATE inventory SET 
              inv_make = $1,
              inv_model = $2,
              inv_description = $3,
              inv_image = $4,
              inv_thumbnail = $5,
              inv_price = $6,
              inv_year = $7,
              inv_miles = $8,
              inv_color = $9,
              classification_id = $10,
              inv_updated = NOW()
          WHERE inv_id = $11
          RETURNING *`;
      
      const data = await pool.query(sql, [
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color,
          classification_id,
          inv_id
      ]);
      
      return data.rows[0];
  } catch (error) {
      console.error("Update inventory error:", error);
      return null;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING *';
    const result = await pool.query(sql, [inv_id]);
    return result;
  } catch (error) {
    console.error('Database delete error:', error);
    throw error;
  }
}
async function getVehicleDetailById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleDetailById error", error);
    throw error;
  }
}


// Export all functions
module.exports = { 
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleDetailById,
  addClassification,
  addInventory,
  updateInventory,
  getInventoryById,
  deleteInventoryItem
};