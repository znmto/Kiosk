import React, { useEffect } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { Favorite, Face, Extension } from "@material-ui/icons";
import { useRouteMatch, useLocation, useHistory } from "react-router-dom";
import {
  HOME,
  ACTIVITY,
  FRIENDS,
  MATCHES,
  MATCHES_FILTER,
  PUBLIC_ACTIVITY,
} from "../Constants/routes";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";
import { MatchesParams, PublicViewParam } from "../Types/shared";

const useStyles = makeStyles((theme: Theme) => ({
  bottomNavigation: {
    width: "100%",
    position: "fixed",
    bottom: "0px",
    borderTop: `1px solid ${theme.palette.secondary.main}`,
    zIndex: 2,
    height: "55px",
  },
  bottomNavigationIcon: {
    fontSize: "28px",
  },
}));

type BottomNavProps = {};

const BottomNav: React.FC<BottomNavProps> = (props: BottomNavProps) => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const user: User = useSession();

  const { params: { publicUid = "", showOnly = "" } = {} } =
    (useRouteMatch<MatchesParams | PublicViewParam>({
      path: [PUBLIC_ACTIVITY, MATCHES_FILTER],
      exact: true,
      strict: true,
    }) as any) || {}; // TODO: react-router exposed types incorrect

  // default view
  const [route, setRoute] = React.useState<string>(location?.pathname);

  const navigate = (route: string): void => history.push(route);

  useEffect(() => {
    setRoute(location?.pathname);
  }, [location, publicUid]);

  return user ? (
    <BottomNavigation
      className={classes.bottomNavigation}
      value={route}
      showLabels
    >
      <BottomNavigationAction
        onClick={(e) => navigate(ACTIVITY)}
        label="My Activity"
        value="/activity"
        icon={<Favorite className={classes.bottomNavigationIcon} />}
      />
      {showOnly ? (
        <BottomNavigationAction
          onClick={(e) => navigate(MATCHES)}
          label="Matches"
          value={`/matches/${showOnly}`}
          icon={<Extension className={classes.bottomNavigationIcon} />}
        />
      ) : (
        <BottomNavigationAction
          onClick={(e) => navigate(MATCHES)}
          label="Matches"
          value="/matches"
          icon={<Extension className={classes.bottomNavigationIcon} />}
        />
      )}
      {publicUid && (
        <BottomNavigationAction
          onClick={() => {}}
          label="Public Profile"
          value={route}
          icon={<Face className={classes.bottomNavigationIcon} />}
        />
      )}
    </BottomNavigation>
  ) : null;
};

export default BottomNav;
