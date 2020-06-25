import React, { useEffect } from "react";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { SupervisorAccount, Home, Favorite } from "@material-ui/icons";
import styled, { StyledProps } from "styled-components";
import { useHistory, useLocation } from "react-router-dom";
import { HOME, ACTIVITY, FRIENDS, MATCHES } from "../Constants/routes";
import { useTheme } from "@material-ui/core/styles";
import { BottomNavigationProps } from "@material-ui/core/BottomNavigation";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";

interface ExtraProps extends BottomNavigationProps {
  secondary?: any; //TODO: fix type
}

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
  // default view
  const [route, setRoute] = React.useState(location?.pathname);

  console.log("location", location);
  const theme = useTheme();
  const user: User = useSession();

  const navigate = (route: string): void => history.push(route);

  useEffect(() => {
    setRoute(location?.pathname);
  }, [location]);

  return user ? (
    <StyledBottomNavigation
      value={route}
      showLabels
      secondary={theme.palette.secondary.main}
    >
      <BottomNavigationAction
        onClick={(e) => navigate(HOME)}
        label="Home"
        value="/home"
        icon={<Home />}
      />
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
        icon={<SupervisorAccount />}
      />
    </StyledBottomNavigation>
  ) : null;
};

export default BottomNav;
