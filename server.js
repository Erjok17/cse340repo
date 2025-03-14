const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();

// View Engine and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Set the views directory
app.use(expressLayouts);
app.set("layout", "layouts/layout"); // Path to your layout file

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

// Start the server
const port = process.env.PORT || 5500;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
