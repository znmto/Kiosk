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
  const persistedToken = await firestore
    .collection("access_tokens")
    .doc(authService)
    .get()
    .then(doc => doc && doc.data())
    .catch(error => console.log("getToken error", error));

  if (persistedToken) {
    const { access_token: accessToken, expires_in: expiresIn } = persistedToken;
    if (accessToken && expiresIn > 86400000) return accessToken; // 1 day to be safe
  }

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
    .then(({ data: response }) => response)
    .catch(error => console.log("newToken error", error));
  // set in DB
  await firestore.collection("access_tokens").doc(authService).set(newToken);
  // return new token
  return newToken;
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
      .catch(error => console.log("cors error", error));
  });
});
