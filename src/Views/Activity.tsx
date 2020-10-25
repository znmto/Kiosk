import React, { memo, useState, useEffect, useContext } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles";
import AsyncSelect from "../Components/AsyncSelect";
import { useSession, FirestoreContext } from "../Helpers/CustomHooks";
import { FIREBASE_GET_ID_URL } from "../Constants/api";
import { User } from "firebase";
import ClipBoardCopy from "../Components/CopyToClipboard";
import { media } from "../Constants/media";
import { LOGIN } from "../Constants/routes";
import Avatar from "@material-ui/core/Avatar";
import { SelectionContext } from "../Helpers/CustomHooks";
import { useHistory, RouteComponentProps } from "react-router-dom";
import { Typography, Grid } from "@material-ui/core";
import { Share } from "@material-ui/icons";
import { Media } from "../Types/shared";
import firebase from "../FirebaseConfig";
import isEmpty from "lodash/isEmpty";

type PublicUser = {
  email: string;
  uid: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  shareableLinkContainer: {
    "& input": {
      width: "300px",
      padding: "5px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
  },
  shareIcon: {
    fontSize: "28px !important",
    color: theme.palette.primary.main,
    margin: "10px 15px 0px 0px",
  },
}));

type MatchParams = {
  publicUid?: string;
};

const Activity: React.FC<RouteComponentProps<MatchParams>> = memo(
  (props: RouteComponentProps<MatchParams>) => {
    const { match: { params = {} } = {} } = props;
    const publicUserId = params?.publicUid;

    const user: User = useSession();
    const classes = useStyles();
    const history = useHistory();
    const {
      setSelection,
      metadata = {},
      setMetadata,
    }: FirestoreContext = useContext(SelectionContext);

    const [publicUser, setPublicUser] = useState<PublicUser>();
    const [loading, setLoading] = useState<boolean>(false);

    const getUserNamesById = async (userIdArr: string[]) => {
      const userIdParam = userIdArr.join(",");
      try {
        const { data } = await axios({
          url: FIREBASE_GET_ID_URL,
          method: "GET",
          params: {
            ids: userIdParam,
          },
        });
        const publicUser: PublicUser = data[0];
        return setPublicUser(publicUser);
      } catch (error) {
        console.log("getUserNamesById error", error);
      }
    };

    useEffect(() => {
      if (!publicUserId && !user) return history.push(LOGIN);
      setLoading(true);
      if (publicUserId) {
        // get public user email/full name/avatar data for page title
        getUserNamesById([publicUserId]);
        // get public user's selections and persist in ctx
        firebase
          .firestore()
          .collection("users")
          .doc(publicUserId)
          .get()
          .then((doc) => {
            if (isEmpty(metadata.publicUser) && doc.data()) {
              const {
                metadata: { avatar, fullName },
              } = doc.data()!;
              setMetadata({ publicUser: { fullName, avatar } });
            }
            const { game, book, tvShow, movie } = doc.data()!;
            return setSelection({ game, book, tvShow, movie });
          })
          .catch((e) => console.log("get public user error", e))
          .finally(() => setLoading(false));
      } else if (user?.uid) {
        // get user's selections and persist in ctx and add listener for changes
        const listener = firebase
          .firestore()
          .collection("users")
          .doc(user?.uid)
          .onSnapshot(
            (doc) => {
              if (doc.data()) {
                if (isEmpty(metadata.user)) {
                  const {
                    metadata: { avatar, fullName },
                  } = doc.data()!;
                  setMetadata({ user: { fullName, avatar } });
                }
                const { game, book, tvShow, movie } = doc.data()!;
                setLoading(false);
                return setSelection({ game, book, tvShow, movie });
              }
            },
            (e) => console.log("get user selections error", e),
            () => setLoading(false)
          );
        // unsubscribe listener
        return () => listener();
      }
    }, [user, publicUserId]);
    return (
      <>
        {!publicUserId ? (
          <Grid
            className={classes.shareableLinkContainer}
            container
            justify="center"
          >
            <Share className={classes.shareIcon} />
            <ClipBoardCopy />
          </Grid>
        ) : (
          <>
            <Grid style={{ paddingTop: 15 }} container justify="center">
              <Avatar
                style={{ margin: "0 15px" }}
                alt={publicUser?.email || ""}
                src={metadata?.publicUser?.avatar}
              />
              <Typography variant="h5">{`${publicUser?.email}'s List`}</Typography>
            </Grid>
          </>
        )}
        <Grid container justify="space-evenly">
          {media.map((m: Media, i: number) => (
            <Grid key={i} item xs={6} style={{ position: "relative" }}>
              <AsyncSelect
                loading={loading}
                publicUserId={publicUserId}
                key={m.label}
                {...m}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
);

export default Activity;
