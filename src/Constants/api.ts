const inProd = process.env.NODE_ENV !== "development";
console.log("inProd", inProd);

const path = inProd
  ? process.env.REACT_APP_API_URL
  : `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PATH}`;

export const FIREBASE_PROXY_URL: string = `${path}/cors`;
export const FIREBASE_GET_USER_URL: string = `${path}/auth/getUserByEmail`;
export const FIREBASE_GET_ID_URL: string = `${path}/auth/getUsersById`;
export const FIREBASE_GET_FRIENDS_URL: string = `${path}/auth/getFriends`;
export const FIREBASE_ADD_FRIEND_URL: string = `${path}/auth/addFriend`;
