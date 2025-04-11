const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { 
    rejectUnauthorized: false 
  } : false
})

// Universal query method for all environments
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { 
        text,
        error: error.message 
      })
      throw error
    }
  },
  
  // Add direct pool access if needed
  getPool: () => pool
}