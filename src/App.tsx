import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import SignupOrLogin from "./Views/SignupOrLogin";
import Profile from "./Views/Profile";
import Home from "./Views/Home";
import Activity from "./Views/Activity";
// import Friends from "./Views/Friends";
import Layout from "./Views/Layout";
import Matches from "./Views/Matches";
import {
  ACTIVITY,
  SIGNUP,
  LOGIN,
  FRIENDS,
  HOME,
  MATCHES,
  PUBLIC_ACTIVITY,
} from "./Constants/routes";
import { useAuth, UserContext, FirestoreContext } from "./Helpers/CustomHooks";
import { UserCredential } from "firebase/firebase-auth";
import { CircularProgress, Grid } from "@material-ui/core";

const App: React.FC = () => {
  const {
    initializing,
    user,
  }: { initializing: boolean; user: UserCredential } = useAuth();
  // const fields: any = useSnapshot(user);
  if (initializing) {
    return (
      <Grid container justify="center">
        <CircularProgress />
      </Grid>
    );
  }
  return (
    <UserContext.Provider value={{ user }}>
      <Router>
        <Layout>
          <Switch>
            <Route path={SIGNUP} exact component={SignupOrLogin} />
            <Route path={LOGIN} exact component={SignupOrLogin} />
            <Route path={ACTIVITY} exact component={Activity} />
            <Route path={PUBLIC_ACTIVITY} exact component={Activity} />
            {/* <Route path={FRIENDS} exact component={Friends} /> */}
            <Route path={MATCHES} exact component={Matches} />
            <Route path={HOME} exact component={Home} />
            {/* <Route path={PROFILE} exact component={Profile} /> */}
          </Switch>
        </Layout>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
