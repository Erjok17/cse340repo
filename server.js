/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");

// View Engine and Templates
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Path to your layout file

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public")); // Serve static files from the "public" folder

/* ***********************
 * Routes
 *************************/
app.use(static);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500; // Use Render's PORT or default to 5500
const host = process.env.HOST || "localhost"; // Use Render's HOST or default to localhost

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`App listening on ${host}:${port}`);
});

// Index Route
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});