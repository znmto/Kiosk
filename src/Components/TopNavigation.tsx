import React, { useContext } from "react";
import IconButton from "@material-ui/core/IconButton";
import { AccountCircle, ExitToApp } from "@material-ui/icons";
import Avatar from "@material-ui/core/Avatar";
import { useHistory } from "react-router-dom";
import { ACTIVITY } from "../Constants/routes";
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
import {
  StyledAccountButtonWrapper,
  StyledLogoutButtonWrapper,
  StyledLoggedInUserHeader,
  StyledTopNavigation,
  StyledTitle,
} from "./TopNavigationStyles";

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
      <div className="logoWrapper">
        <a
          href="https://en.wikipedia.org/wiki/Advertising_column"
          rel="noopener norefferer"
        >
          <img alt="Kiosk Logo" src={logo} />
        </a>
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
