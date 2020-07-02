const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.authOnCreate = functions.auth.user().onCreate(async user => {
  // set initial default DB entry
  await firestore
    .collection("users")
    .doc(user.uid)
    .set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        avatar: `https://avatars.dicebear.com/api/human/${user.uid}.svg`,
        email: user.email,
        displayName: user.displayName,
      },
      movie: {},
      tvShow: {},
      game: {},
      book: {},
      friends: [],
    });
});

exports.authOnDelete = functions.auth.user().onDelete(async user => {
  await firestore.collection("users").doc(user.uid).delete();
});
