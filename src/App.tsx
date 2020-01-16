import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import SignupOrLogin from './Views/SignupOrLogin';
import Profile from './Views/Profile';
import Home from './Views/Home';
import Activity from './Views/Activity';
import Friends from './Views/Friends';
import Layout from './Views/Layout';
import { ACTIVITY, SIGNUP, LOGIN, FRIENDS, HOME } from './Constants/routes';
import { useAuth, UserContext, FirestoreContext } from './Helpers/CustomHooks';
import { UserCredential } from 'firebase/firebase-auth';

const App: React.FC = () => {
  const { initializing, user }: { initializing: boolean, user: UserCredential } = useAuth();
  // const fields: any = useSnapshot(user);
  if (initializing) {
    console.log('process.env', process.env);
    return <div>Loading</div>
  }
  return (
    <UserContext.Provider value={{ user }}>
    {/* <FirestoreContext.Provider value={fields}> */}
         <Router>
            <Layout>
              <Route path={SIGNUP} exact component={SignupOrLogin} />
              <Route path={LOGIN} exact component={SignupOrLogin} />
              <Route path={ACTIVITY} exact component={Activity} />
              <Route path={FRIENDS} exact component={Friends} />
              <Route path={HOME} exact component={Home} />
              {/* <Route path={PROFILE} exact component={Profile} /> */}
          </Layout>
         </Router>
      {/* </FirestoreContext.Provider> */}
      </UserContext.Provider>
  );
}

export default App;
