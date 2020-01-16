const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

module.exports = {
  ...require("./http-functions.js"),
  ...require("./auth-functions.js"),
  ...require("./triggers.js"),
  // ...require("./lib/bar.js") // add as many as you like
};