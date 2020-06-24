const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./service_account_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://majora-563d6.firebaseio.com",
});

// aggregate cloud functions for express app
module.exports = {
  ...require("./http-functions.js"),
  ...require("./auth-functions.js"),
  ...require("./triggers.js"),
};
