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
  MATCHES_FILTER,
  PUBLIC_ACTIVITY,
} from "../Constants/routes";
import { useTheme, Theme } from "@material-ui/core/styles";
import { BottomNavigationProps } from "@material-ui/core/BottomNavigation";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";
import { MatchesParams, PublicViewParam } from "../Types/common";

type BottomNavProps = {
  secondary?: any; //TODO: fix type
};

const StyledBottomNavigation = styled(BottomNavigation)`
  width: 100%;
  position: fixed;
  bottom: 0;
  border-top: 1px solid ${(props: BottomNavProps) => props.secondary};
  z-index: 2;
  grid-template-columns: 1fr 1fr 1fr;
  display: grid;
  justify-items: center;
  height: 55px;
` as any;

const BottomNav: React.FC<BottomNavProps> = (props: BottomNavProps) => {
  const location = useLocation();
  const history = useHistory();
  const { params: { publicUid = "", showOnly = "" } = {} } =
    (useRouteMatch<MatchesParams | PublicViewParam>({
      path: [PUBLIC_ACTIVITY, MATCHES_FILTER],
      exact: true,
      strict: true,
    }) as any) || {}; // TODO: react-router exposed types incorrect

  // default view
  const [route, setRoute] = React.useState<string>(location?.pathname);

  console.log("location", location);
  const theme: Theme = useTheme();
  const user: User = useSession();

  const navigate = (route: string): void => history.push(route);

  useEffect(() => {
    setRoute(location?.pathname);
  }, [location, publicUid]);

  return user ? (
    <StyledBottomNavigation
      value={route}
      showLabels
      secondary={theme.palette.secondary.main}
    >
      <BottomNavigationAction
        onClick={(e) => navigate(ACTIVITY)}
        label="My Activity"
        value="/activity"
        icon={<Favorite />}
      />
      {showOnly ? (
        <BottomNavigationAction
          onClick={(e) => navigate(MATCHES)}
          label="Matches"
          value={`/matches/${showOnly}`}
          icon={<Announcement />}
        />
      ) : (
        <BottomNavigationAction
          onClick={(e) => navigate(MATCHES)}
          label="Matches"
          value="/matches"
          icon={<Announcement />}
        />
      )}
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
