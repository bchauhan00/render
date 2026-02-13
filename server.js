const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const data = require("./data-service");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// About route
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// Project route
app.get("/project", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "project.html"));
});

// employees route
app.get("/employees", (req, res) => {
  data
    .getAllEmployees()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });

  // res.send("Hello");
});

// managers route
app.get("/managers", (req, res) => {
  data
    .getManagers()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// departments route
app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

// ✅ Express v5-safe catch-all
app.use((req, res) => {
  res.redirect("/");
});

// 404 error handler for undefined routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

// setup server
data.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Unable to start server: " + err);
  });