import React, { useState, useEffect } from "react";
import axios from "axios";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import { SupervisorAccount, Favorite } from "@material-ui/icons";
import styled from "styled-components";
import { Grid, Typography } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { useSession } from "../Helpers/CustomHooks";
import firebase from "../FirebaseConfig";
import { FIREBASE_GET_USER_URL } from "../Constants/api";
import { User } from "firebase";

const Home: React.FC = (props) => {
  // const reducer = (state, payload) => ({ ...state, ...payload });
  // const [state, dispatch] = useReducer(reducer, { friends: []});

  const theme = useTheme();
  const user: User = useSession();

  const firestore = firebase.firestore();
  const [feedData, setFeedData] = useState([]);
  const [friendsArr, setFriendsArr] = useState([]);

  const getFeedData = async (friends: string[]) => {
    try {
      const { data } = await axios({
        url: FIREBASE_GET_USER_URL,
        method: "GET",
        headers: {},
        params: {
          ids: friends,
        },
      });
      return data;
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    const listener = firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((doc) => {
        const source = doc.metadata.hasPendingWrites;
        const friends = doc.data() && doc.data()!.friends;
        return setFriendsArr(friends);
      });
    return () => listener();
  }, [user.uid]);

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={12}>
        <Typography variant="h3">
          Please click on My Activity below to get started.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default Home;
