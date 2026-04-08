const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// employee schema definition
const employeeSchema = new Schema({
  employeeNum: {
    type: Number,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  SSN: String,
  addressStreet: String,
  addressCity: String,
  addressState: String,
  addressPostal: String,
  maritalStatus: String,
  isManager: {
    type: Boolean,
    default: false,
  },
  employeeManagerNum: Number,
  status: String,
  hireDate: String,
  department: {
    type: Number,
    ref: "Department",
  },
});

// department schema definition
const departmentSchema = new Schema({
  departmentId: {
    type: Number,
    required: true,
    unique: true,
  },
  departmentName: {
    type: String,
    required: true,
  },
});

// Create models
const Employee = mongoose.model("Employee", employeeSchema);
const Department = mongoose.model("Department", departmentSchema);

// non-srv connection w/ mongodb
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const uri = process.env.MONGODB_URI; 
    if (!uri) {
      reject("MONGODB_URI is not defined in .env");
      return;
    }

    mongoose
      .connect(uri)
      .then(() => {
        console.log("Successfully connected to MongoDB");
        resolve();
      })
      .catch((err) => {
        reject(`Unable to connect to MongoDB: ${err}`);
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.find({})
      .lean()
      .then((employees) => {
        if (employees.length === 0) {
          reject("no results returned");
          return;
        }
        resolve(employees);
      })
      .catch((err) => {
        reject(`Error fetching employees: ${err}`);
      });
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise(function (resolve, reject) {
    Employee.find({ status: status })
      .lean()
      .then((employees) => {
        if (employees.length === 0) {
          reject("no results returned");
          return;
        }
        resolve(employees);
      })
      .catch((err) => {
        reject(`Error fetching employees: ${err}`);
      });
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise(function (resolve, reject) {
    Employee.find({ department: parseInt(department) })
      .lean()
      .then((employees) => {
        if (employees.length === 0) {
          reject("no results returned");
          return;
        }
        resolve(employees);
      })
      .catch((err) => {
        reject(`Error fetching employees: ${err}`);
      });
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise(function (resolve, reject) {
    Employee.find({ employeeManagerNum: parseInt(manager) })
      .lean()
      .then((employees) => {
        if (employees.length === 0) {
          reject("no results returned");
          return;
        }
        resolve(employees);
      })
      .catch((err) => {
        reject(`Error fetching employees: ${err}`);
      });
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise(function (resolve, reject) {
    Employee.findOne({ employeeNum: parseInt(num) })
      .lean()
      .then((employee) => {
        if (!employee) {
          reject("no results returned");
          return;
        }
        resolve(employee);
      })
      .catch((err) => {
        reject(`Error fetching employee: ${err}`);
      });
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise(function (resolve, reject) {
    // Set isManager property properly (convert to boolean)
    employeeData.isManager = employeeData.isManager ? true : false;

    // Replace any empty string values with null
    for (let prop in employeeData) {
      if (employeeData[prop] === "") {
        employeeData[prop] = null;
      }
    }

    // Get the highest employeeNum and increment by 1
    Employee.findOne()
      .sort({ employeeNum: -1 })
      .then((lastEmployee) => {
        const newEmployeeNum = lastEmployee ? lastEmployee.employeeNum + 1 : 1;
        employeeData.employeeNum = newEmployeeNum;

        // Create and save the new employee
        const newEmployee = new Employee(employeeData);
        return newEmployee.save();
      })
      .then((savedEmployee) => {
        resolve(savedEmployee);
      })
      .catch((err) => {
        reject(`unable to create employee: ${err}`);
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    // Set isManager property properly (convert to boolean)
    employeeData.isManager = employeeData.isManager ? true : false;

    // Replace any empty string values with null
    for (let prop in employeeData) {
      if (employeeData[prop] === "") {
        employeeData[prop] = null;
      }
    }

    // Update the employee by employeeNum
    Employee.updateOne(
      { employeeNum: employeeData.employeeNum },
      { $set: employeeData },
    )
      .then((result) => {
        if (result.modifiedCount === 0 && result.matchedCount === 0) {
          reject("unable to update employee");
          return;
        }
        resolve();
      })
      .catch((err) => {
        reject(`unable to update employee: ${err}`);
      });
  });
};

module.exports.deleteEmployeeByNum = function (empNum) {
  return new Promise((resolve, reject) => {
    // Delete the employee by employeeNum
    Employee.deleteOne({ employeeNum: parseInt(empNum) })
      .then((result) => {
        if (result.deletedCount === 0) {
          reject("Unable to remove employee / Employee not found");
          return;
        }
        resolve();
      })
      .catch((err) => {
        reject(`Unable to remove employee: ${err}`);
      });
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.find({})
      .lean()
      .then((departments) => {
        if (departments.length === 0) {
          reject("no results returned");
          return;
        }
        resolve(departments);
      })
      .catch((err) => {
        reject(`Error fetching departments: ${err}`);
      });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.find({ departmentId: parseInt(id) })
      .lean()
      .then((departments) => {
        if (departments.length === 0) {
          reject("no results returned");
          return;
        }
        // Return only the first object as specified
        resolve(departments[0]);
      })
      .catch((err) => {
        reject(`no results returned: ${err}`);
      });
  });
};

module.exports.addDepartment = function (departmentData) {
  return new Promise(function (resolve, reject) {
    // Replace any empty string values with null
    for (let prop in departmentData) {
      if (departmentData[prop] === "") {
        departmentData[prop] = null;
      }
    }

    // Get the highest departmentId and increment by 1
    Department.findOne()
      .sort({ departmentId: -1 })
      .then((lastDepartment) => {
        const newDepartmentId = lastDepartment
          ? lastDepartment.departmentId + 1
          : 1;
        departmentData.departmentId = newDepartmentId;

        // Create and save the new department
        const newDepartment = new Department(departmentData);
        return newDepartment.save();
      })
      .then((savedDepartment) => {
        resolve(savedDepartment);
      })
      .catch((err) => {
        reject(`unable to create department: ${err}`);
      });
  });
};

module.exports.updateDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    // Replace any empty string values with null
    for (let prop in departmentData) {
      if (departmentData[prop] === "") {
        departmentData[prop] = null;
      }
    }

    // Update the department by departmentId
    Department.updateOne(
      { departmentId: departmentData.departmentId },
      { $set: departmentData },
    )
      .then((result) => {
        if (result.modifiedCount === 0 && result.matchedCount === 0) {
          reject("unable to update department");
          return;
        }
        resolve();
      })
      .catch((err) => {
        reject(`unable to update department: ${err}`);
      });
  });
};

module.exports.deleteDepartmentById = function (id) {
  return new Promise((resolve, reject) => {
    Department.deleteOne({ departmentId: parseInt(id) })
      .then((result) => {
        if (result.deletedCount === 0) {
          reject("no results returned");
          return;
        }
        resolve();
      })
      .catch((err) => {
        reject(`unable to delete department: ${err}`);
      });
  });
};
