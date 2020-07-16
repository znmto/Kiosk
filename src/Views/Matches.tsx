import React, { useReducer, useEffect, useContext } from "react";
import {
  Grid,
  makeStyles,
  Theme,
  Paper,
  Typography,
  Link,
  Avatar,
} from "@material-ui/core";
import {
  useSession,
  SelectionContext,
  FirestoreContext,
} from "../Helpers/CustomHooks";
import firebase from "../FirebaseConfig";
import { User } from "firebase";
import { media } from "../Constants/media";
import isEmpty from "lodash/isEmpty";
import { useParams } from "react-router-dom";
import { MatchesParams } from "../Types/shared";
import { Media } from "../Types/shared";

const useStyles = makeStyles((theme: Theme) => ({
  matchesMediaThumbnail: {
    width: "200px",
    borderRadius: "6px",
    display: "block",
    margin: "15px auto",
  },
  matchesWrapper: {
    padding: "50px",
  },
  mediaIconWrapper: {
    "& svg": {
      fontSize: "32px",
    },
    color: theme.palette.primary.main,
    textAlign: "center",
  },
  mediaPanel: {
    padding: "15px 50px",
  },
  hidden: {
    display: "none",
  },
  avatar: {
    margin: "5px 15px",
    display: "inline-block",
  },
  noMediaMatches: {
    maxWidth: 300,
    textAlign: "center",
  },
  disabledLink: {
    pointerEvents: "none",
  },
}));

const Matches: React.FC = (props) => {
  const classes = useStyles();
  const user: User = useSession();
  const params = useParams<MatchesParams>();
  const { selections = {} }: FirestoreContext = useContext(SelectionContext);

  const reducer = (state, payload) => ({ ...state, ...payload });
  const [state, dispatch] = useReducer(reducer, {
    usersThatHaveSelected: {},
  });

  useEffect(() => {
    if (user?.uid && !isEmpty(selections.game)) {
      const getSetUsersThatHaveSelected = () => {
        Promise.all(
          media.map((k) => {
            if (isEmpty(selections[k.firestoreKey])) return false;
            firebase
              .firestore()
              .collection("media")
              .doc(selections![k.firestoreKey]?.id)
              .get()
              .then((doc) => {
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
  }, [selections, user]);

  return (
    <Grid
      className={classes.matchesWrapper}
      container
      justify={!isEmpty(params) ? "center" : "space-between"}
    >
      {media.map((m: Media) => {
        const mediaMatches = state.usersThatHaveSelected[m.firestoreKey];
        return (
          <Grid
            item
            key={m.firestoreKey}
            className={
              !isEmpty(params) && params.showOnly !== m.firestoreKey
                ? classes.hidden
                : ""
            }
          >
            <Paper variant="outlined" className={classes.mediaPanel}>
              <div className={classes.mediaIconWrapper}>{m.icon}</div>
              <img
                className={classes.matchesMediaThumbnail}
                alt=""
                src={selections[m.firestoreKey]?.value?.image}
              />
              <Grid container justify="center" direction="column">
                {mediaMatches ? (
                  mediaMatches.map(({ id, email, avatar, fullName }) => {
                    const displayEmail: string =
                      user?.uid === id ? `${email} (you)` : email;
                    return (
                      <Grid container item alignItems="center">
                        <Avatar
                          className={classes.avatar}
                          alt={email}
                          src={avatar}
                        />
                        <Link
                          className={
                            user?.uid === id ? classes.disabledLink : ""
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${window.location.origin}/activity/${id}`}
                        >
                          {displayEmail}
                        </Link>
                      </Grid>
                    );
                  })
                ) : (
                  <>
                    <Typography className={classes.noMediaMatches} variant="h6">
                      {`Select a ${m.label} in the `}
                      <Link href="/activity">Activity </Link>
                      tab to see recommendations
                    </Typography>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Matches;
