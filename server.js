const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// View Engine and Templates
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Path to your layout file

// Routes
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

// Start the server
const port = process.env.PORT || 5500;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});