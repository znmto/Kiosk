const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

const app = express();
require("dotenv").config();

// resolve any uexpected CORS issues
app.use(function (req, res, next) {
  const allowedOrigins = ["http://localhost:3000", "https://majora-563d6.web.app"];
  if (allowedOrigins.indexOf(req.headers.origin) !== -1) {
    res.set("Access-Control-Allow-Origin", req.headers.origin);
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }
  next();
});

app.get("/getUsersById", (req, res) => {
  const promises = [];
  const ids = req.query.ids.split(",");
  ids.forEach(id =>
    promises.push(
      admin
        .auth()
        .getUser(id.trim())
        .then(({ email, displayName, uid }) => ({ email, displayName, uid }))
    )
  );
  Promise.all(promises)
    .then(values => res.status(200).json(values))
    .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get("/getUserByEmail", (req, res) => {
  const { email } = req.query;
  admin
    .auth()
    .getUserByEmail(email)
    .then(({ uid }) => res.status(200).json({ email, uid }))
    .catch(error => res.status(500).json({ error: error.toString() }));
});

exports.auth = functions.https.onRequest(app);
