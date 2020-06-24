const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

require("tls").DEFAULT_ECDH_CURVE = "auto";

exports.cors = functions.https.onRequest((req, res) => {
  console.log("req", req.body);
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
        console.log("data", data);
        console.log("status", status);
        if (status === 200) res.status(200).send(data);
      })
      .catch(error => console.log("error", error.response.status, error.response.statusText, error.response.data));
  });
});
