const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = admin.firestore();

exports.authOnCreate = functions.auth.user().onCreate(async user => {
    console.log(`Creating document for user ${user.uid}`);
    // set initial default DB entry
    await firestore.collection('users').doc(user.uid).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        movie: {},
        tvShow: {},
        game: {},
        book: {},
        friends: [],
    });
});

exports.authOnDelete = functions.auth.user().onDelete(async user => {
    console.log(`Deleting document for user ${user.uid}`);
    await firestore.collection('users').doc(user.uid).delete();
});