import React, { useState, useContext, createContext, useEffect } from 'react';
import firebase from '../FirebaseConfig';
import { User } from 'firebase';
import isEmpty from 'lodash/isEmpty';


export const UserContext = createContext({ user: null });
export const FirestoreContext = createContext({ document: {} });

export const useSession = () => {
    const { user } = useContext(UserContext)
    return user;
}

export const useAuth = () => {
    const [state, setState] = useState(() => {
        const user: User | null = firebase.auth().currentUser;
        return { initializing: !user, user, } 
    });
    const onChange = user => {
        console.log('user', user)
        setState({ initializing: false, user });
    };

    useEffect(() => {
        // listen for auth state changes
        const unsubscribe = firebase.auth().onAuthStateChanged(onChange);
        // unsubscribe to the listener when unmounting
        return () => unsubscribe()
    }, []);

    return state;
}

// export const useSnapshot = (user) => {
//     const [state, setState] = useState(() => {
//         // if (!user) return {};
//         console.log('user in usesnapshot', user);
//         const document: any = !isEmpty(user) ? firebase.firestore().collection('users').doc(user.uid) : {};
//         // const document: any = !isEmpty(user) ? firebase.firestore().collection('users').doc(user.uid) : {};
//         return document;
//     });
//     const onChange = document => {
//         console.log('usesnaspshot onchange document', document)
//         setState({ document });
//     };
    
//     useEffect(() => {
//         // listen for  state changes
//         if (!isEmpty(document)) { !isEmpty(user) &&firebase.firestore().collection('users').doc(user.uid).onSnapshot(onChange) } 
//     }, [document]);
//     // useEffect(() => {
//     //     // listen for  state changes
//     //     const unsubscribe = !isEmpty(document) ? document.onSnapshot(onChange) : () => {};
//     //     // unsubscribe to the listener when unmounting
//     //     return () => unsubscribe()
//     // }, [user]);

//     return state;
// }