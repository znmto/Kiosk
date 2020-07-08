import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import SignupOrLogin from "./Views/SignupOrLogin";
import Home from "./Views/Home";
import Activity from "./Views/Activity";
import Layout from "./Views/Layout";
import Matches from "./Views/Matches";
import {
  ACTIVITY,
  SIGNUP,
  LOGIN,
  LANDING,
  HOME,
  MATCHES,
  MATCHES_FILTER,
  PUBLIC_ACTIVITY,
} from "./Constants/routes";
import {
  useAuth,
  UserContext,
  FirestoreContextProvider,
} from "./Helpers/CustomHooks";
import { UserCredential } from "firebase/firebase-auth";
import { CircularProgress, Grid } from "@material-ui/core";

const App: React.FC = () => {
  const {
    initializing,
    user,
  }: { initializing: boolean; user: UserCredential } = useAuth();
  if (initializing) {
    return (
      <Grid
        style={{ height: "100vh" }}
        container
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <CircularProgress style={{ color: "#325247" }} size={100} />
        </Grid>
      </Grid>
    );
  }
  return (
    <UserContext.Provider value={{ user }}>
      <FirestoreContextProvider>
        <Router>
          <Layout>
            <Switch>
              <Route
                path={LANDING}
                exact
                render={() => <Redirect to={ACTIVITY} />}
              />
              <Route path={SIGNUP} exact component={SignupOrLogin} />
              <Route path={LOGIN} exact component={SignupOrLogin} />
              <Route path={ACTIVITY} exact component={Activity} />
              <Route path={PUBLIC_ACTIVITY} exact component={Activity} />
              <Route path={MATCHES} exact component={Matches} />
              <Route path={MATCHES_FILTER} exact component={Matches} />
              <Route path={HOME} exact component={Home} />
            </Switch>
          </Layout>
        </Router>
      </FirestoreContextProvider>
    </UserContext.Provider>
  );
};

export default App;
