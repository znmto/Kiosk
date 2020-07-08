// incorporates code from https://github.com/the-road-to-react-with-firebase/react-firestore-authentication
import React, { useState, useEffect, Suspense } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Card,
  CardMedia,
  Typography,
  makeStyles,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Container from "@material-ui/core/Container";
import firebase from "../FirebaseConfig";
import { SIGNUP, LOGIN, HOME, ACTIVITY } from "../Constants/routes";
import { UserCredential } from "firebase/firebase-auth";
import { DocumentReference } from "firebase/firebase-app";
import List from "@material-ui/core/List";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import LockIcon from "@material-ui/icons/Lock";
import styled from "styled-components";
import { useTheme, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  authError: {
    "& h3": {
      fontWeight: 600,
      color: "red",
      textAlign: "center",
    },
  },
}));

const StyledSampleLoginsCard = styled(Card)`
  margin: 50px 0;
`;

const SignupOrLogin = (props) => {
  const firebaseAuth = firebase.auth();
  const firestore = firebase.firestore();

  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const theme: Theme = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const isSignup: boolean = location.pathname === SIGNUP;

  const labelsMap = {
    [SIGNUP]: {
      title: "Sign Up",
    },
    [LOGIN]: {
      title: "Log In",
    },
  }[location.pathname];

  const handleSignup = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const {
        user,
      }: {
        user: UserCredential;
      } = await firebaseAuth.createUserWithEmailAndPassword(email, password);
      // Wait until document is created by Cloud Functions code
      const userDocRef: DocumentReference = firebase
        .firestore()
        .collection("users")
        .doc(user.uid);
      const unsubscribe = userDocRef.onSnapshot({
        next: (snapshot) => {
          unsubscribe();
        },
        error: (error) => {
          console.log(error);
          setAuthError(error.message);
          unsubscribe();
        },
      });
      // redirect to home
      history.push(ACTIVITY);
    } catch (error) {
      setAuthError(error.message);
      console.error(error);
    }
  };

  const handleLogin = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      const res = await firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );
      const { additionalUserInfo, credential, operationType, user } = res;
      // redirect to home if successful
      res.user && history.push(ACTIVITY);
    } catch (error) {
      setAuthError(error.message);
      console.error(error);
    }
  };

  // useEffect(() => console.log('labelsMap', labelsMap['title']), []);
  // useEffect(() => console.log('email / pass change', email, password), [email, password]);

  return (
    <Suspense fallback={<h1>LOADING</h1>}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          {!isSignup && (
            <StyledSampleLoginsCard variant="outlined">
              <CardContent>
                <Typography variant="h5" align="center">
                  Sample Logins
                </Typography>
                <Typography variant="body2" align="center">
                  (click to prefill form)
                </Typography>
                <List component="nav" aria-label="main mailbox folders">
                  <ListItem
                    button
                    onClick={() => {
                      setEmail("test@example.com");
                      setPassword("test123");
                    }}
                  >
                    <ListItemIcon>
                      {email === "test@example.com" ? (
                        <LockIcon htmlColor={theme.palette.success.main} />
                      ) : (
                        <LockOpenIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText primary="test@example.com / test123" />
                  </ListItem>
                  <ListItem
                    button
                    onClick={() => {
                      setEmail("test1@example.com");
                      setPassword("test123");
                    }}
                  >
                    <ListItemIcon>
                      {email === "test1@example.com" ? (
                        <LockIcon htmlColor={theme.palette.success.main} />
                      ) : (
                        <LockOpenIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText primary="test1@example.com / test123" />
                  </ListItem>
                </List>
              </CardContent>
            </StyledSampleLoginsCard>
          )}
          <Typography component="h1" variant="h5">
            {labelsMap["title"]}
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isSignup && (
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
            )}
            <div className={classes.authError}>
              <h3>{authError}</h3>
            </div>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={(e) => (isSignup ? handleSignup(e) : handleLogin(e))}
            >
              {labelsMap["title"]}
            </Button>
            {!isSignup && (
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            )}
          </form>
        </div>
      </Container>
    </Suspense>
  );
};

export default SignupOrLogin;
