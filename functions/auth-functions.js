const functions = require("firebase-functions");
const admin = require('firebase-admin');
const cors = require("cors")


const express = require("express");
// const bodyParser = require('body-parser');

const app = express();
// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    next();
});
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json())

app.get('/getUserById', (req, res) => {
    let promises = [];
    req.query.ids.forEach(id => promises.push(
        admin.auth().getUser(id.trim())
            .then(({ email, displayName, uid }) =>({ email, displayName, uid }))
    ))
    Promise.all(promises)
            .then(values => res.json(values))
            .catch(error => res.status(500).json({ error: error.toString() }));

    
    // console.log("REQ QUERY", req.query);
    // const { ids } = req.query;
    // const getResults = async () => {
    //     let userRecords = [];
    //     await Promise.all(
    //         ids.map(async f => {
    //             const trimmedId = f.trim();
    //             await admin.auth().getUser(trimmedId)
    //             .then(({ email, displayName, uid }) => {
    //                 console.log('email', email);
    //                 userRecords.push({ email, displayName, uid })
    //             })        
    //         }))
    //         .then(() => res.json(userRecords))
    //         .catch(error => res.status(500).json({ error: error.toString() }));
    // }

    // getResults();
});
app.get('/getUserByEmail', (req, res) => {
    const { email } = req.query;
    admin.auth().getUserByEmail(email)
    .then(({ uid }) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully fetched user data:', uid);
        const response = { email, uid }
        console.log('response', response);
        return res
            .contentType('application/json')
            .status(200)
            .json(response);
    })
    .catch(error => {
        console.log('error', error);
        res.status(500).json({ error: error.toString() })
    })
          
});

app.post('/addFriend', cors({ origin: true, methods: 'POST, OPTIONS'}), (req, res) => {
    console.log('req.query.email', req.query.email);
    const { email, currentUserUid } = req.body;
    const user = { email };
    const getUser = admin.auth().getUserByEmail(user.email);
    getUser
        .then(({ uid }) => user.uid = uid)
        .then(async _ => {
            console.log('_', _);
            const fields = await admin.firestore.collection('users').doc(currentUserUid);
            console.log('fields', fields);
            const existingFriends = fields.friends;
            console.log('existingFriends', existingFriends);
            const updatedFriends = existingFriends.concat(user);
            await fields.update({
                friends: updatedFriends
            });
            return updatedFriends
        })
        .then(updatedFriends => res.status(200).json(updatedFriends))
        .catch(error => res.status(500).json({ error: error.toString() }))
})

exports.auth = functions.https.onRequest(app);