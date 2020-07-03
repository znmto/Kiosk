import React, { useReducer, useEffect, useContext } from "react";
import { Grid, makeStyles, Theme, Paper } from "@material-ui/core";
import styled from "styled-components";
import { useSession, SelectionContext } from "../Helpers/CustomHooks";
import firebase from "../FirebaseConfig";
import { User } from "firebase";
import { media, Media } from "../Constants/media";
import isEmpty from "lodash/isEmpty";
import { useParams } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Link from "@material-ui/core/Link";
import { MatchesParams } from "../Types/common";

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
    fontSize: "36px",
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
}));

const Matches: React.FC = (props) => {
  const classes = useStyles();
  const user: User = useSession();
  const params = useParams<MatchesParams>();
  const { selections, _ }: any = useContext(SelectionContext);

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
            item
            key={m.firestoreKey}
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
              <Grid container justify="center" direction="column">
                {state.usersThatHaveSelected[m.firestoreKey]?.map(
                  ({ id, email, avatar, fullName }) => {
                    return (
                      <Grid container item alignItems="center">
                        <Avatar
                          className={classes.avatar}
                          alt={email}
                          src={avatar}
                        />
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`${window.location.origin}/activity/${id}`}
                        >
                          {email}
                        </Link>
                      </Grid>
                    );
                  }
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
