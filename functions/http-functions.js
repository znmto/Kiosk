const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");
const admin = require("firebase-admin");
const { isEmpty } = require("lodash");

const firestore = admin.firestore();
require("tls").DEFAULT_ECDH_CURVE = "auto";

const authServiceToClientSecretMap = authService =>
  ({
    twitch: {
      secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  }[authService]);

const getToken = async ({ authService, url, clientId }) => {
  console.log("clientId", clientId);
  const { access_token: accessToken, expires_in: expiresIn } = await firestore
    .collection("access_tokens")
    .doc(authService)
    .get()
    .then(doc => doc && doc.data())
    .catch(error => console.log("getToken error: ", error));
  console.log("accessToken", accessToken);
  if (expiresIn > 86400000) return accessToken;

  const newToken = await axios({
    url,
    method: "POST",
    headers: {},
    params: {
      client_id: clientId,
      client_secret: authServiceToClientSecretMap(authService).secret,
      grant_type: authServiceToClientSecretMap(authService).grant_type,
    },
    data: {},
  })
    .then(({ data: response }) => {
      console.log("response", response);
      return response;
    })
    .catch(error => console.log("newToken error", error));
  // set in FB
  console.log("newToken", newToken);
  await firestore.collection("access_tokens").doc(authService).set(newToken);

  return newToken;
  // return new token
};
exports.cors = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const {
      body: { url, body: data, method, headers, metadata },
    } = req;

    let token;
    const augmentedHeaders = headers;
    if (!isEmpty(metadata)) {
      const { tokenPreAuthUrl, clientId, authService } = metadata;
      if (tokenPreAuthUrl) {
        token = await getToken({ url: tokenPreAuthUrl, clientId, authService });
      }
    }
    if (token) {
      augmentedHeaders.Authorization = `Bearer ${token.access_token}`;
      augmentedHeaders["Client-ID"] = metadata.clientId;
    }
    console.log("augmentedHeaders", augmentedHeaders);
    console.log("url, method, data", url, method, data);
    axios({
      url,
      method,
      headers: {
        "Content-type": "application/json",
        ...augmentedHeaders,
      },
      data,
    })
      .then(({ status, data: response }) => {
        if (status === 200) res.status(200).send(response);
      })
      .catch(error => console.log("error", error.response.status, error.response.statusText, error.response.data));
  });
});
