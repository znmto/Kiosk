export const FIREBASE_PROXY_URL: string = 'http://localhost:5001/majora-563d6/us-central1/cors'
// export const FIREBASE_PROXY_URL: string = `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PATH}/cors`
export const FIREBASE_GET_USER_URL: string =`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PATH}/auth/getUserByEmail`;
export const FIREBASE_GET_FRIENDS_URL: string =`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PATH}/auth/getFriends`;
export const FIREBASE_ADD_FRIEND_URL: string =`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PATH}/auth/addFriend`;

