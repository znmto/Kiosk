import React, { useState, useEffect } from 'react';
import axios from 'axios';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { SupervisorAccount, Favorite } from '@material-ui/icons';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import { useSession } from "../Helpers/CustomHooks";
import firebase from '../FirebaseConfig';
import { FIREBASE_GET_USER_URL } from '../Constants/api';


const Home: React.FC = props => {
  // const reducer = (state, payload) => ({ ...state, ...payload });
  // const [state, dispatch] = useReducer(reducer, { friends: []});

  const theme = useTheme();
  const user: any = useSession();

  const firestore = firebase.firestore();
  const [feedData, setFeedData] = useState([]);
  const [friendsArr, setFriendsArr] = useState([]);

  const getFeedData = async (friends: string[]) => {
      try {
        console.log('friends before getUserByEmail', friends);
        const { data, status } = await axios({
          url: FIREBASE_GET_USER_URL,
          method: 'GET',
          headers: {
            'Content-type': 'application/json'
          },
          params: {
            ids: friends,
          },
        });
        console.log('data', data);
        console.log('status', status);
        return data;



      } catch (error) {
        console.log('get friend emails error', error.message);
      }
  }



  useEffect(() => {
      const listener = firebase.firestore().collection('users').doc(user.uid).onSnapshot((doc) => {
        console.log('doc', doc);
        const source = doc.metadata.hasPendingWrites;
        const friends = doc.data() && doc.data()!.friends;
        console.log('source', source);
        console.log('doc.data', doc.data())
        return setFriendsArr(friends);
      });
      return () => listener();
  }, []);


  // useEffect(() => {
  //   console.log('friends useeffect');
  // }, [state.friends])
  return (
    <div></div>
    // <div>
    //   {state.friends.map(f => 
    //   <h2 key={f}>{f}</h2>
    //     )}
      // <button role="button" onClick={() => getFeedData(friendsArr[0].friends)}>get</button>
    // </div>
  )
}

export default Home;