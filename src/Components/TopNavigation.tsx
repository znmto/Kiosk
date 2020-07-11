import React, { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import { AccountCircle, ExitToApp } from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { HOME, ACTIVITY } from "../Constants/routes";
import { LOGIN } from "../Constants/routes";
import firebase from "../FirebaseConfig";
import {
  useSession,
  SelectionContext,
  FirestoreContext,
} from "../Helpers/CustomHooks";
import { useTheme, Theme } from "@material-ui/core/styles";
import logo from "../images/logo.png";
import { User } from "firebase";
import isEmpty from "lodash/isEmpty";

type StyleProps = {
  secondary?: string;
  primary?: string;
};

const StyledAccountButtonWrapper = styled.div`
  position: relative;
  right: 40px;
  grid-row: 2;
  grid-column: 3;
  & button {
    padding: 15px;
    color: ${(props: StyleProps) => props.secondary};
  }
  justify-self: end;
`;
const StyledLogoutButtonWrapper = styled.div`
  position: relative;
  grid-row: 2;
  grid-column: 3;
  justify-self: end;
  & button {
    padding: 15px;
    color: ${(props: StyleProps) => props.secondary};
  }
`;
const StyledLoggedInUserHeader = styled(Typography)`
  position: relative;
  right: 10px;
  grid-row: 3;
  grid-column: 3;
  justify-self: end;
  margin: 0;
  color: ${(props: StyleProps) => props.primary};
`;
const StyledTopNavigation = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  border-bottom: 1px solid ${(props: StyleProps) => props.secondary};
  z-index: 2;
  display: grid;
  justify-items: center;
  height: 100px;
  background-color: #fff;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  input {
    display: "none";
  }
  .logoWrapper {
    justify-self: start;
    position: absolute;
    cursor: pointer;
    & img {
      width: 80px;
    }
  }
`;

const StyledTitle = styled(Typography)`
  grid-column: 2;
  grid-row: 2;
  margin: 0;
  color: #325247;
  font-family: "Hind Vadodara", sans-serif !important;
  cursor: pointer;
`;

const TopNav: React.FC = () => {
  const history = useHistory();
  const user: User = useSession();
  const theme: Theme = useTheme();
  const { metadata = {} }: FirestoreContext = useContext(SelectionContext);
  const handleProfileClick = (): void => {
    // if session, redirect to account
    // else redirect to login
    history.push(user ? ACTIVITY : LOGIN);
  };
  const handleLogout = (): void => {
    try {
      firebase.auth().signOut();
    } catch (error) {
      console.log("handleLogout error", error);
    } finally {
      history.push(LOGIN);
    }
  };
  return (
    <StyledTopNavigation>
      <div className="logoWrapper" onClick={(_) => history.push(ACTIVITY)}>
        <img alt="Kiosk Logo" src={logo} />
      </div>
      <StyledTitle variant="h2" onClick={(_) => history.push(ACTIVITY)}>
        Kiosk
      </StyledTitle>
      <StyledAccountButtonWrapper
        onClick={handleProfileClick}
        secondary={theme.palette.secondary.main}
      >
        <IconButton aria-label="account">
          {!isEmpty(metadata.user) ? (
            <Avatar alt={user?.email || ""} src={metadata?.user?.avatar} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
      </StyledAccountButtonWrapper>
      {user && (
        <StyledLogoutButtonWrapper
          onClick={handleLogout}
          secondary={theme.palette.secondary.main}
        >
          <IconButton aria-label="logout">
            <ExitToApp />
          </IconButton>
        </StyledLogoutButtonWrapper>
      )}
      {user && (
        <StyledLoggedInUserHeader primary={theme.palette.primary.main}>
          {user.email}
        </StyledLoggedInUserHeader>
      )}
    </StyledTopNavigation>
  );
};

export default TopNav;
