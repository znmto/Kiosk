import React, { memo, useState, useEffect, useContext } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core";
import { useTheme, Theme } from "@material-ui/core/styles";
import styled from "styled-components";
import AsyncSelect from "../Components/AsyncSelect";
import { useSession } from "../Helpers/CustomHooks";
import { FIREBASE_GET_ID_URL } from "../Constants/api";
import { User } from "firebase";
import ClipBoardCopy from "../Components/CopyToClipboard";
import { media } from "../Constants/media";
import { LOGIN } from "../Constants/routes";
import Avatar from "@material-ui/core/Avatar";
import { SelectionContext } from "../Helpers/CustomHooks";
import { useHistory } from "react-router-dom";
import { Typography, Grid } from "@material-ui/core";
import { Share } from "@material-ui/icons";
import { Media } from "../Types/common";

type StyleProps = {
  color?: string;
};

type PublicUser = {
  email: string;
  uid: string;
};

const StyledMediaSelectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-evenly;
`;

const useStyles = makeStyles((theme: Theme) => ({
  shareableLinkContainer: {
    padding: "40px 0 20px",
    "& input": {
      width: "300px",
      padding: "5px",
    },
  },
  shareIcon: {
    fontSize: "28px !important",
    color: theme.palette.primary.main,
    margin: "10px 15px 0px 0px",
  },
}));

interface ActivityProps {
  match?: any;
}

const Activity: React.FC<ActivityProps> = memo((props: ActivityProps) => {
  const { match: { params = {} } = {} } = props;
  const publicUid = params?.publicUid;

  const [publicUser, setPublicUser] = useState<PublicUser>();
  const theme: Theme = useTheme();
  const user: User = useSession();
  const classes = useStyles();
  const history = useHistory();
  const { metadata }: any = useContext(SelectionContext);

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
      console.log("data", data);
      const publicUser: PublicUser = data[0];
      return setPublicUser(publicUser);
    } catch (error) {
      console.log("error", error.response);
    }
  };
  useEffect(() => {
    if (!publicUid && !user) return history.push(LOGIN);
    if (publicUid) {
      getUserNamesById([publicUid]);
    }
  }, []);
  return (
    <>
      {!publicUid ? (
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
      <StyledMediaSelectionWrapper>
        {media.map((m: Media) => (
          <AsyncSelect publicUserId={publicUid} key={m.label} {...m} />
        ))}
      </StyledMediaSelectionWrapper>
    </>
  );
});

export default Activity;
