import React, { useEffect } from "react";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import {
  SupervisorAccount,
  Home,
  Favorite,
  Face,
  EmojiObjects,
  Announcement,
} from "@material-ui/icons";
import styled, { StyledProps } from "styled-components";
import { useRouteMatch, useLocation, useHistory } from "react-router-dom";
import {
  HOME,
  ACTIVITY,
  FRIENDS,
  MATCHES,
  PUBLIC_ACTIVITY,
} from "../Constants/routes";
import { useTheme, Theme } from "@material-ui/core/styles";
import { BottomNavigationProps } from "@material-ui/core/BottomNavigation";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";

type ExtraProps = {
  secondary?: any; //TODO: fix type
};

// type MatchParams = {
//   params: Params;
// };

// type Params = {
//   publicUid: string;
// };

const StyledBottomNavigation = styled(BottomNavigation)`
  width: 100%;
  position: fixed;
  bottom: 0;
  border-top: 1px solid ${(props: ExtraProps) => props.secondary};
  z-index: 2;
  grid-template-columns: 1fr 1fr 1fr;
  display: grid;
  justify-items: center;
  height: 55px;
` as any;

const BottomNav: React.FC = (props) => {
  let location = useLocation();
  let history = useHistory();
  let { params: { publicUid = "" } = {} } =
    (useRouteMatch({
      path: PUBLIC_ACTIVITY,
      exact: true,
      strict: true,
    }) as any) || {}; // TODO: react-router exposed types incorrect

  // default view
  const [route, setRoute] = React.useState(location?.pathname);

  console.log("location", location);
  const theme: Theme = useTheme();
  const user: User = useSession();

  const navigate = (route: string): void => history.push(route);

  useEffect(() => {
    console.log("location", location);
    console.log("history", history);
    console.log("match", publicUid);
    console.log("route", route);
    // user.whatever = 1;
    console.log("user", user);
    setRoute(location?.pathname);
  }, [location, history, publicUid]);

  return user ? (
    <StyledBottomNavigation
      value={route}
      showLabels
      secondary={theme.palette.secondary.main}
    >
      {/* <BottomNavigationAction
        onClick={(e) => navigate(HOME)}
        label="Home"
        value="/home"
        icon={<Home />}
      /> */}
      <BottomNavigationAction
        onClick={(e) => navigate(ACTIVITY)}
        label="My Activity"
        value="/activity"
        icon={<Favorite />}
      />
      <BottomNavigationAction
        onClick={(e) => navigate(MATCHES)}
        label="Matches"
        value="/matches"
        icon={<Announcement />}
      />
      {publicUid && (
        <BottomNavigationAction
          onClick={() => {}}
          label="Public Profile"
          value={route}
          icon={<Face />}
        />
      )}
    </StyledBottomNavigation>
  ) : null;
};

export default BottomNav;
