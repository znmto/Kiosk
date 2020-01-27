const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

require("tls").DEFAULT_ECDH_CURVE = "auto";

exports.cors = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    const {
      body: { url, body, method, headers }
    } = req;
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
        .then(({ status, data }) => status === 200 && res.status(200).send(data));
    } catch (error) {
      console.error(error);
    }
  });
});
