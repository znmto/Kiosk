import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useReducer,
} from "react";
import firebase from "../FirebaseConfig";
import { User } from "firebase";

export const UserContext = createContext({ user: {} as User });
export const FirestoreContext = createContext({ document: {} });
export const SelectionContext = createContext({});

export const useSession = () => {
  const { user } = useContext(UserContext);
  return user;
};

export const useAuth = () => {
  const [state, setState] = useState(() => {
    const user = firebase.auth().currentUser;
    return { initializing: !user, user };
  });
  const onChange = (user) => {
    setState({ initializing: false, user });
  };

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged(onChange);
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, []);

  return state;
};

export const SelectionContextProvider = ({ children }) => {
  const reducer = (state, payload) => ({ ...state, ...payload });
  const [selections, setSelection] = useReducer(reducer, {
    movie: {},
    tvShow: {},
    game: {},
    book: {},
  });

  return (
    <>
      <SelectionContext.Provider value={{ selections, setSelection }}>
        {children}
      </SelectionContext.Provider>
    </>
  );
};
