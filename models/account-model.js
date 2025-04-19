const pool = require('../database/');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password // This now receives the hashed password
    ]);
  } catch (error) {
    console.error("REGISTRATION ERROR:", error.message);
    return null;
  }
}
/* *****************************
*   Check for existing email
* *************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rowCount > 0
  } catch (error) {
    console.error("EMAIL CHECK ERROR:", error)
    return false
  }
}

/* *****************************
*   classification
* *************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("ADD CLASSIFICATION ERROR:", error);
    return null;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* *****************************
*  Get account data by account_id
* *************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: " + error);
    return null;
  }
}

/* *****************************
*  Update account information
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ]);
  } catch (error) {
    console.error("updateAccount error: " + error);
    return null;
  }
}

/* *****************************
*  Update password
* *************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    return await pool.query(sql, [
      account_password,
      account_id
    ]);
  } catch (error) {
    console.error("updatePassword error: " + error);
    return null;
  }
}

// Updated the module.exports to include new functions
module.exports = { 
  registerAccount,
  checkExistingEmail,
  addClassification,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword
}