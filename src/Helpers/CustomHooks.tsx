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
export const SelectionContext = createContext({});

export const useSession = (): User => {
  const { user } = useContext(UserContext);
  return user;
};

type UseAuthState = {
  initializing: boolean;
  user: User | null;
};

export const useAuth = (): UseAuthState => {
  const [state, setState] = useState<UseAuthState>(() => {
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

type ContextMedia = {
  id: string;
  label: string;
  value: ContextMediaValue;
};

type ContextMediaValue = {
  title: string;
  rating: number;
  id: string;
  type: string;
  subtitle: string;
  image: string;
};

type FirestoreContextUser = {
  fullName?: string;
  avatar?: string;
  email?: string;
};
type FirestoreContextMedatata = {
  publicUser?: FirestoreContextUser;
  user?: FirestoreContextUser;
};

type FirestoreContextSelections = {
  movie?: ContextMedia;
  tvShow?: ContextMedia;
  game?: ContextMedia;
  book?: ContextMedia;
};

type FirestoreContextState = {
  selections?: FirestoreContextSelections;
  metadata?: FirestoreContextMedatata;
};

export const FirestoreContextProvider = ({ children }) => {
  const reducer = (
    state: FirestoreContextState,
    payload: FirestoreContextSelections & FirestoreContextMedatata
  ) => ({
    ...state,
    ...payload,
  });
  const [selections, setSelection] = useReducer<any>(reducer, {
    movie: {},
    tvShow: {},
    game: {},
    book: {},
  });
  const [metadata, setMetadata] = useReducer<any>(reducer, {
    user: {},
    publicUser: {},
  });

  return (
    <>
      <SelectionContext.Provider
        value={{ selections, setSelection, metadata, setMetadata }}
      >
        {children}
      </SelectionContext.Provider>
    </>
  );
};
