const fs = require("fs");

let employees = [];
let departments = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/departments.json", "utf8", (err, data) => {
      if (err) {
        reject("Unable to read the file: departments.json");
        return;
      }
      departments = JSON.parse(data);

      fs.readFile("./data/employees.json", "utf8", (err, data) => {
        if (err) {
          reject("Unable to read the file: employees.json");
          return;
        }
        employees = JSON.parse(data);

        resolve();
      });
    });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    if (employees.length == 0) {
      reject("No employees found");
      return;
    }

    resolve(employees);
  });
};

module.exports.getManagers = function () {
  return new Promise(function (resolve, reject) {
    var filteredEmployeees = [];

    for (let i = 0; i < employees.length; i++) {
      if (employees[i].isManager == true) {
        filteredEmployeees.push(employees[i]);
      }
    }

    if (filteredEmployeees.length == 0) {
      reject("No managers found");
      return;
    }

    resolve(filteredEmployeees);
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    if (departments.length == 0) {
      reject("No departments found");
      return;
    }

    resolve(departments);
  });
};
