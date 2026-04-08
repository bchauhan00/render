const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const data = require("./data-service");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const exphbs = require("express-handlebars");

const app = express();
dotenv.config();

// set HTTP_PORT
const HTTP_PORT = process.env.PORT || 8080;

// configure Handlebars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        const activeRoute = this.activeRoute || "";

        // Normalize both URLs by removing trailing slashes for comparison
        const normalizedUrl = url.replace(/\/$/, "");
        const normalizedActiveRoute = activeRoute.replace(/\/$/, "");

        const isActive = normalizedUrl === normalizedActiveRoute;
        const activeClass = isActive
          ? ' class="nav-link active" aria-current="page"'
          : ' class="nav-link"';

        return `<li class="nav-item"><a href="${url}"${activeClass}>${options.fn(this)}</a></li>`;
      },
      equal: function (lvalue, rvalue) {
        return lvalue == rvalue;
      },
    },
  }),
);

app.set("view engine", ".hbs");

// multer configuration
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// tells multer to use disk storage function
const upload = multer({ storage: storage });

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// body-parser configuration
app.use(bodyParser.urlencoded({ extended: true }));

// middleware to set active route
app.use((req, res, next) => {
  res.locals.activeRoute = req.path;
  next();
});

// index route
app.get("/", (req, res) => {
  res.render("home");
});

// about route
app.get("/about", (req, res) => {
  res.render("about");
});

/* -----------------------------
   Images routes starts here
------------------------------ */

// add image route
app.get("/images/add", (req, res) => {
  res.render("addImage");
});

// to get the image names as array (image route)
app.get("/images", (req, res) => {
  try {
    const items = fs.readdirSync("./public/images/uploaded");
    res.render("images", { images: items });
  } catch (err) {
    res.render("images", { message: "no results" });
  }
});

/* -----------------------------
   Employees routes starts here
------------------------------ */

// employees routes (with queries)
app.get("/employees", (req, res) => {
  if (req.query.status) {
    data
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        // Check if data array has items
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.department) {
    data
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        // Check if data array has items
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else if (req.query.manager) {
    data
      .getEmployeesByManager(req.query.manager)
      .then((data) => {
        // Check if data array has items
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  } else {
    data
      .getAllEmployees()
      .then((data) => {
        // Check if data array has items
        if (data.length > 0) {
          res.render("employees", { employees: data });
        } else {
          res.render("employees", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
  }
});

// addEmployee route (inside employees.hbs)
app.get("/employees/add", (req, res) => {
  // Try to get departments from database
  data
    .getDepartments()
    .then((departments) => {
      // Success - render with departments data
      res.render("addEmployee", {
        departments: departments,
        layout: "main",
      });
    })
    .catch((err) => {
      // Error or no departments - render with empty array
      console.log("Could not load departments:", err);
      res.render("addEmployee", {
        departments: [],
        layout: "main",
      });
    });
});

// get a single employee with a value
app.get("/employee/:empNum", (req, res) => {
  // Get employee data first
  data
    .getEmployeeByNum(req.params.empNum)
    .then((employeeData) => {
      // Then get all departments
      return data
        .getDepartments()
        .then((departmentsData) => {
          // Pass both to the template
          res.render("employee", {
            employee: employeeData,
            departments: departmentsData,
          });
        })
        .catch((err) => {
          // If departments fail, still show employee but with empty departments
          console.log("Could not load departments:", err);
          res.render("employee", {
            employee: employeeData,
            departments: [],
          });
        });
    })
    .catch((err) => {
      console.log("Employee not found:", err);
      res.render("employee", { message: "no results" });
    });
});

// Delete employee route
app.get("/employees/delete/:empNum", (req, res) => {
  data
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});

/* -----------------------------
   Departments routes starts here
------------------------------ */

// departments route
app.get("/departments", (req, res) => {
  data
    .getDepartments()
    .then((data) => {
      // Check if data array has items
      if (data.length > 0) {
        res.render("departments", { departments: data });
      } else {
        res.render("departments", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("departments", { message: "no results" });
    });
});

// addDepartment route (inside departments.hbs)
app.get("/departments/add", (req, res) => {
  res.render("addDepartment");
});

// department by ID route
app.get("/department/:departmentId", (req, res) => {
  data
    .getDepartmentById(req.params.departmentId)
    .then((data) => {
      if (data === undefined) {
        res.status(404).send("Department Not Found");
      } else {
        res.render("department", { department: data });
      }
    })
    .catch((err) => {
      res.status(404).send("Department Not Found");
    });
});

// delete department route
app.get("/departments/delete/:departmentId", (req, res) => {
  data
    .deleteDepartmentById(req.params.departmentId)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res
        .status(500)
        .send("Unable to Remove Department / Department not found");
    });
});

/* -----------------------------
   POST routes starts here
------------------------------ */

// form data (employee data) upload POST method
app.post("/employees/add", (req, res) => {
  data
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.json({ message: "coulden't create employee!!" });
    });
});

// Update employee route (POST)
app.post("/employee/update", (req, res) => {
  data
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Unable to Update Employee");
    });
});

// add department POST route
app.post("/departments/add", (req, res) => {
  data
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.json({ message: "couldn't create department!!" });
    });
});

// update department POST route
app.post("/department/update", (req, res) => {
  data
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Department");
    });
});

// image upload POST method
app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

// 404 error handler for undefined routes
app.use((req, res) => {
  res.status(404).render("404");
});

// setup server
data
  .initialize()
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log(`App listening on port: ${HTTP_PORT}`);
    });
  })
  .catch(function (err) {
    console.log(`Unable to start server: ${err}`);
  });
