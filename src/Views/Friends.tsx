import React, { useState, useEffect } from "react";
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  makeStyles
} from "@material-ui/core";
import styled from 'styled-components';
import axios from "axios";
import debounce from "lodash/debounce";
import { useSession } from "../Helpers/CustomHooks";
import firebase from '../FirebaseConfig';

import { FIREBASE_GET_USER_URL } from "../Constants/api";

const useStyles = makeStyles(theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  authError: {
    "& h3": {
      fontWeight: 600,
      color: "red",
      textAlign: "center"
    }
  }
}));

const StyledFriendsWrapper = styled.div`
  width: 500px;
  margin: 20% auto;
`; 

const Friends: React.FC = props => {
  const classes = useStyles();
  const [friendEmail, setFriendEmail] = useState("");
  const [friendsArr, setFriendsArr] = useState([]);
  const user: any = useSession();

  const setFriend = e => {
    console.log("e", e);
    const trimmed = e.trim();
    setFriendEmail(trimmed);
  };

  // const getFriends = async () => {
  //   try {
  //     const { data, status } = await axios({
  //       url: FIREBASE_GET_FRIENDS_URL,
  //       method: "GET",
  //       headers: {
  //         "Content-type": "application/json"
  //       },
  //       params: {
  //         uid: user.uid,
  //       }
  //     });
  //     console.log("data", data);
  //     setFriendsArr(data);
  //   } catch (error) {
  //     console.log('error', error);
  //     console.error(error.message);
  //   }
  // }

  const handleAddFriend = async e => {
    e.preventDefault();
    console.log("e", e);
    try {
      const { data, status } = await axios({
        method: 'GET',
        url: FIREBASE_GET_USER_URL,
        headers: {
          'Content-type': 'application/json'
        },
        params: {
          email: friendEmail,
        },

      });
      console.log('data, status', data, status);
      const newState = friendsArr.concat(data);

      const fields = await firebase.firestore().collection('users').doc(user.uid);
      console.log('collection before', fields);
      console.log('friendsArr before', friendsArr);
      await fields.update({
        friends: newState, 
      });
      console.log('friendsArr after', newState);

      return setFriendsArr(newState);

    } catch (error) {
      console.log('error', error);
    }
  };

useEffect(() => {
  // getFriends();
  console.log('mount state', friendsArr);
  const listener = firebase.firestore().collection('users').doc(user.uid).onSnapshot((doc) => {
    const source = doc.metadata.hasPendingWrites;
    const friends = doc.data() ? doc.data()!.friends : [];
    console.log('source', source);
    console.log('doc.data', doc.data())
    return setFriendsArr(friends)
  });
  return () => listener();
}, [])

  const authError = "";

  return (
    <StyledFriendsWrapper>
      <div>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={friendEmail}
            onChange={e => setFriend(e.target.value)}
            // onChange={e => debounce(setFriend(e.target.value), 500)}
          />
          <div className={classes.authError}>
            <h3>{authError}</h3>
          </div>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={e => handleAddFriend(e)}
          >
            ADd
          </Button>
        </form>
      </div>
      <div>
        {friendsArr.length &&
          friendsArr.map(({ email = "" }) => <h2>{email}</h2>)}
      </div>
    </StyledFriendsWrapper>
  );
};

export default Friends;
