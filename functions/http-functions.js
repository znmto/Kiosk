const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

require("tls").DEFAULT_ECDH_CURVE = "auto";

exports.cors = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    const {
      body: { url, body: data, method, headers },
    } = req;
    axios({
      url,
      method,
      headers: {
        "Content-type": "application/json",
        ...headers,
      },
      data,
    })
      .then(({ status, data }) => {
        if (status === 200) res.status(200).send(data);
      })
      .catch(error => console.log("error", error.response.status, error.response.statusText, error.response.data));
  });
});
