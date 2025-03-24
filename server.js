const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require('./utilities');

const app = express();

// View Engine and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/layout");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (e) {
    console.error('Could not build navigation:', e.message);
    nav = '<ul><li><a href="/">Home</a></li></ul>'; // Fallback simple nav
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.stack || err.message}`);
  
  const message = err.status == 404 
    ? err.message 
    : 'Oh no! There was a crash. Maybe try a different route?';
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
  });
});

// Server Configuration
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port}`);
});