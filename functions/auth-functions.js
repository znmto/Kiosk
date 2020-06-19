const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");

const app = express();
// Add headers
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});

app.get("/getUsersById", (req, res) => {
  console.log("in route");
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
    .then(values => res.json(values))
    .catch(error => res.status(500).json({ error: error.toString() }));
});

app.get("/getUserByEmail", (req, res) => {
  const { email } = req.query;
  admin
    .auth()
    .getUserByEmail(email)
    .then(({ uid }) => {
      const response = { email, uid };
      return res.contentType("application/json").status(200).json(response);
    })
    .catch(error => res.status(500).json({ error: error.toString() }));
});

app.post("/addFriend", cors({ origin: true, methods: "POST, OPTIONS" }), (req, res) => {
  const { email, currentUserUid } = req.body;
  const user = { email };
  const getUser = admin.auth().getUserByEmail(user.email);
  getUser
    .then(({ uid }) => (user.uid = uid))
    .then(async _ => {
      const fields = await admin.firestore.collection("users").doc(currentUserUid);
      const existingFriends = fields.friends;
      const updatedFriends = existingFriends.concat(user);
      await fields.update({
        friends: updatedFriends,
      });
      return updatedFriends;
    })
    .then(updatedFriends => res.status(200).json(updatedFriends))
    .catch(error => res.status(500).json({ error: error.toString() }));
});

exports.auth = functions.https.onRequest(app);
