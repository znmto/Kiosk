import React, { useReducer, useEffect, useContext } from "react";
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
import { useSession, SelectionContext } from "../Helpers/CustomHooks";
import firebase from "../FirebaseConfig";
import { FIREBASE_GET_USER_URL } from "../Constants/api";
import { User } from "firebase";
import { media, Media } from "../Constants/media";
import isEmpty from "lodash/isEmpty";
import { useParams } from "react-router-dom";

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
  hidden: {
    display: "none",
  },
}));

type MatchesParams = {
  showOnly?: string;
};

const StyledFriendsWrapper = styled.div`
  width: 500px;
  margin: 20% auto;
`;

const Matches: React.FC = (props) => {
  const classes = useStyles();
  const user: User = useSession();
  const params = useParams<MatchesParams>();
  console.log("params", params);
  const { selections, setSelection }: any = useContext(SelectionContext);

  const reducer = (state, payload) => ({ ...state, ...payload });
  const [state, dispatch] = useReducer(reducer, {
    usersThatHaveSelected: {},
  });

  useEffect(() => {
    console.log("Object.entries(selections)", Object.values(selections));
    if (user?.uid && !isEmpty(selections.game)) {
      const getSetUsersThatHaveSelected = () => {
        console.log("selections", selections);
        Promise.all(
          media.map((k) => {
            if (isEmpty(selections[k.firestoreKey])) return false;
            firebase
              .firestore()
              .collection("media")
              .doc(selections![k.firestoreKey]?.id)
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
      };
      getSetUsersThatHaveSelected();
    }
  }, [selections]);
  return (
    <Grid
      className={classes.matchesWrapper}
      container
      justify={!isEmpty(params) ? "center" : "space-between"}
    >
      {media.map((m: Media) => {
        return (
          <Grid
            key={m.firestoreKey}
            item
            className={
              !isEmpty(params) &&
              params.showOnly !== m.firestoreKey &&
              (classes.hidden as any)
            }
          >
            <Paper variant="outlined" className={classes.mediaPanel}>
              <div className={classes.mediaIconWrapper}>{m.icon}</div>
              <img
                className={classes.matchesMediaThumbnail}
                alt="media-thumbnail"
                src={selections[m.firestoreKey]?.value?.image}
              />
              {state.usersThatHaveSelected[m.firestoreKey]?.map(
                ({ id, email }) => {
                  return (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${window.location.origin}/activity/${id}`}
                    >
                      {email}
                    </a>
                  );
                }
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Matches;
