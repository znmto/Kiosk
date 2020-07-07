const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");

const app = express();
// Add headers
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

app.post("/addFriend", (req, res) => {
  const { email, currentUserUid } = req.body;
  const user = { email };
  const getUser = admin.auth().getUserByEmail(user.email);
  getUser
    .then(({ uid }) => (user.uid = uid))
    .then(async something => {
      // TODO: fix this noob code
      const fields = await admin.firestore.collection("users").doc(currentUserUid);
      const existingFriends = fields.friends;
      const updatedFriends = existingFriends.concat(user);
      // TODO: fix this noob code
      await fields.update({
        friends: updatedFriends,
      });
      return updatedFriends;
    })
    .then(updatedFriends => res.status(200).json(updatedFriends))
    .catch(error => res.status(500).json({ error: error.toString() }));
});

exports.auth = functions.https.onRequest(app);
