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
  const [mediaMetadata, setMediaMetadata] = useState({});
  const [matches, setMatches] = useState({
    hasMovie: [],
    hasBook: [],
    hasGame: [],
    hasTvShow: [],
  });

  useEffect(() => {
    console.log("matches", matches);
    if (user?.uid) {
      const userStuff = firebase // TODO: get this from a future context
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get()
        .then((doc) => {
          const media = doc.data() && doc.data();
          console.log("media", media);
          setMediaMetadata(media || {});
        });
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
                src={mediaMetadata[m.firestoreKey]?.value?.image}
              />
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Matches;
