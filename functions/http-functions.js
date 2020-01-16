"use strict";

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

// const fetch = require("node-fetch");
const axios = require("axios");
require("tls").DEFAULT_ECDH_CURVE = "auto";

exports.cors = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {
      body: { url, body, method, headers }
    } = req;
    console.log("REQ", req);
    console.log("REQ BODY", req.body);
    console.log("REQ QUERY", req.query);
    try {
      axios({
        url,
        method,
        headers: {
          "Content-type": "application/json",
          ...headers
        },
        body
      })
        .then(
          ({ status, data }) => status === 200 && res.status(200).send(data)
        )
        .then(r => {
          console.log("AXIOS RESPONSE STATUS:", r.status);
          console.log("AXIOS RESPONSE BODY:", r.data);
          console.log("AXIOS RESPONSE REQUEST:", r.request);
        });
      // .then(r => {
      //     r.status === 200 && res.status(200).send(r)
      //   }
      //     );
    } catch (error) {
      console.error(error);
    }
  });
});
