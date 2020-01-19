const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// aggregate cloud functions for express app
module.exports = {
  ...require("./http-functions.js"),
  ...require("./auth-functions.js"),
  ...require("./triggers.js"),
};