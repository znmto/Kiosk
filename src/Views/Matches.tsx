import React, { useReducer, useEffect } from "react";
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
  makeStyles,
  Theme,
  Paper,
} from "@material-ui/core";
import styled from "styled-components";
import axios from "axios";
import debounce from "lodash/debounce";
import { useSession } from "../Helpers/CustomHooks";
import firebase from "../FirebaseConfig";
import { FIREBASE_GET_USER_URL } from "../Constants/api";
import { User } from "firebase";
import { media, Media } from "../Constants/media";

const useStyles = makeStyles((theme: Theme) => ({
  matchesMediaThumbnail: { width: 150, borderRadius: 6 },
  matchesWrapper: {
    padding: 50,
  },
  mediaIconWrapper: {
    fontSize: 36,
    color: theme.palette.primary.main,
    textAlign: "center",
  },
  mediaPanel: {
    padding: "15px 50px",
  },
}));

const StyledFriendsWrapper = styled.div`
  width: 500px;
  margin: 20% auto;
`;

const Matches: React.FC = (props) => {
  const classes = useStyles();
  const user: User = useSession();

  const reducer = (state, payload) => ({ ...state, ...payload });
  const [state, dispatch] = useReducer(reducer, {
    mediaMetadata: {},
    usersThatHaveSelected: {},
  });
  //   const [matches, setMatches] = useState({

  //   });

  useEffect(() => {
    console.log("state", state);
  }, [state]);
  useEffect(() => {
    if (user?.uid) {
      const getSetMediaMetadata = () => {
        let mediaMetadata;
        firebase // TODO: get this from a future context
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get()
          .then((doc) => {
            // mediaMetadata = doc.data();
            dispatch({ mediaMetadata: doc.data() });
            return doc.data();
          })
          .then((r) => {
            console.log("r", r);

            return Promise.all(
              media.map((k) => {
                firebase
                  .firestore()
                  .collection("media")
                  .doc(r![k.firestoreKey]?.id)
                  .get()
                  .then((doc) => {
                    console.log("doc.data()", doc.data());
                    const stateCopy = state.usersThatHaveSelected;
                    stateCopy[k.firestoreKey] = doc.data()!.currentlySelectedBy;
                    return dispatch({
                      usersThatHaveSelected: stateCopy,
                    });
                  });
              })
            );
          });

        // const obj = {};

        // newMatchesState.then((r) => {
        //   r.forEach((x) => {
        //     console.log("x", x);
        //   });
        // });

        // dispatch({
        //   mediaMetadata,
        //   usersThatHaveSelected: newMatchesState,
        // });

        console.log("state", state);
      };
      getSetMediaMetadata();
    }
  }, []);

  return (
    <Grid className={classes.matchesWrapper} container justify="space-between">
      {media.map((m: Media) => {
        return (
          <Grid key={m.firestoreKey} item>
            <Paper variant="outlined" className={classes.mediaPanel}>
              <div className={classes.mediaIconWrapper}>{m.icon}</div>
              <img
                className={classes.matchesMediaThumbnail}
                alt="media-thumbnail"
                src={state.mediaMetadata[m.firestoreKey]?.value?.image}
              />
              {state.usersThatHaveSelected[m.firestoreKey]?.map((u) => {
                console.log("u", u);
                return (
                  <a
                    target="_blank"
                    rel="noopener noreferer"
                    href={`${window.location.origin}/activity/${u}`}
                  >
                    {u}
                  </a>
                );
              })}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Matches;
