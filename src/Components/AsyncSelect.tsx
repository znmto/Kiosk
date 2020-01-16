import 'isomorphic-fetch';
import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import TextField from '@material-ui/core/TextField';
import AsyncSelect from 'react-select/async';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { FIREBASE_PROXY_URL } from '../Constants/api';
import chroma from 'chroma-js';
import Loader from './Loader';
import { useTheme } from '@material-ui/core/styles';
import firebase from '../FirebaseConfig';
import { useSession } from "../Helpers/CustomHooks";
import { Typography } from '@material-ui/core';
import { FaTrashAlt } from 'react-icons/fa';

interface StyleProps {
  quadrant?: number[];
  primary?: string;
  iconStyles?: string;
  danger?: string;
  colors?: any;
}


const StyledMediaSelectorWrapper = styled.div`
    display: grid;
    width: 250px;
    margin: 0 auto;
    grid-column: ${({ quadrant = [] }: StyleProps) => quadrant[0]};
    grid-row: ${({ quadrant = [] }: StyleProps) => quadrant[1]};
    height: calc((100vh - 255px) / 2);
    align-content: end;
    padding: 25px 150px;
    img {
      width: 250px;
      margin: 0 auto;
    };
    ${({ quadrant = [], primary }: StyleProps) => quadrant[0] === 1 && quadrant[1] === 1 && 
      `
      &::after {
      content: "";
      border: 1px solid ${primary};
      position: relative;
      top: 25px;
      left: 300px;
      align-self: center;
      width: 200px;
      }
      `};
    ${({ quadrant = [], primary }: StyleProps) => quadrant[0] === 2 && quadrant[1] === 1 && 
      `
      &::before {
      content: "";
      border: 1px solid ${primary};
      position: relative;
      top: 44%;
      right: 50%;
      align-self: center;
      width: 0px;
      height: 200px;
      }
      `};
` as any;

const StyledIconWrapper = styled.div`
    font-size: 28px;
    color: ${(props: StyleProps) => props.primary};
    text-align: center;
    position: absolute;
    ${({ iconStyles = '' }: StyleProps) => iconStyles};
` as any;

const StyledLoader = styled(Loader)`
  margin: 0 auto;
  display: inline-block;
`; 
const StyledDescriptionContainer = styled.div`
  text-align: center;
  & a {
    text-decoration: none;
    color: unset;
  }
`;

const StyledTrashIconContainer = styled.div`
    color: ${({ danger = '' }: StyleProps) => danger};
    cursor: pointer;
    font-size: 24px;
`; 

const selectStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = '#000';
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.color
        : isFocused
        ? color
        : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? chroma.contrast(color, 'white') > 2
          ? 'white'
          : 'black'
        : '#FFF',
      cursor: isDisabled ? 'not-allowed' : 'pointer',

      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? color : color),
      },
    };
  },
  input: styles => ({ ...styles }),
  placeholder: styles => ({ ...styles }),
  singleValue: (styles, { data }) => ({ ...styles }),
};



const AsyncSelectWrapper = props => {
  const { label, url: apiUrl, headers, method, data, searchParam, schemaParser, icon, firestoreKey = '', quadrant = [], externalUrl = '', iconStyles= '' } = props;
  const reducer = (state, payload) => ({ ...state, ...payload });

  const theme = useTheme();
  const user: any = useSession();

  const firestore = firebase.firestore();
  const [state, dispatch] = useReducer(reducer, { selected: {}});

  
  const handleOnChange = async selectedOption => {
    console.log('onChange selectedOption', selectedOption);
    console.log('user', user);
    // set in firebase
    const fields = await firestore.collection('users').doc(user.uid);
    console.log('collection before', fields);
    console.log('state before', state);
    const res = await fields.update({
      [firestoreKey]: selectedOption, 
    });
    console.log('onChange db response', res);
    console.log('collection after', fields);
    // dispatch({ selectedOption });

  };

  const handleOnFocus = _ => console.log('onFocus');

  
  const handleLoadOptions = (inputValue: string, callback) => {
    console.log('inputValue', inputValue)
    if(!inputValue) return callback([]);
    return callCloudFn(inputValue, callback);
  };
  
  const callCloudFn = async (maybeInput: string, callback) => {
    try {
      const parametrizedUrl = searchParam ? apiUrl.concat(`&${searchParam}=${maybeInput}`) : apiUrl;
      console.log('paramet', parametrizedUrl);
      const { data: response, status } = await axios({
        url: FIREBASE_PROXY_URL,
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          url: parametrizedUrl,
          body: data,
          method,
          headers,
        },
      })
      console.log('response.Search', response.Search);
      return callback(schemaParser(response));
    } catch (error) {
      console.log('error', error);
    }
  };

  const getImage = () => {
    const { selected: { value : { image = '' } = {} } = {} } = state;
    console.log('get image state', state);
    if (!isEmpty(state.selected)) return <img src={image} />;
    return <></>;
  }
 
  const getDecription = () => {
    const { selected: { value: { title = '', subtitle = '', id = ''} = {} } = {} } = state;
    if(!isEmpty(state.selected)){
      return (
        <StyledDescriptionContainer>
          <Typography component="h1" variant="h3">
          <a href={`${externalUrl}${id}`} rel="noopener noreferrer">
            {title}
          </a>
          </Typography>
          <Typography component="h1" variant="h5">{subtitle}</Typography>
        </StyledDescriptionContainer>
      )
    }
  };
 
  const handleClear = async () => {
    const fields = await firestore.collection('users').doc(user.uid);
    console.log('state before', state);
    await fields.update({
      [firestoreKey]: {}, 
    });
    console.log('state after', state);
  };

    useEffect(() => {
      console.log('mount state', state);
        const listener = firebase.firestore().collection('users').doc(user.uid).onSnapshot((doc) => {
          const source = doc.metadata.hasPendingWrites;
          const selected = doc.data() && doc.data()![firestoreKey];
          console.log('source', source);
          console.log('doc.data', doc.data())
          return dispatch({ selected })
        });
        return () => listener();
    }, []);
  
  return (
    <StyledMediaSelectorWrapper quadrant={quadrant} primary={theme.palette.primary.main}>
      {!isEmpty(state.selected) &&       
      <StyledTrashIconContainer danger={theme.palette.error.main} onClick={handleClear}>
        <FaTrashAlt/>
      </StyledTrashIconContainer>}
      {/* <h3>{label}</h3> */}
      {getImage()}
      {getDecription()}
      <StyledIconWrapper primary={theme.palette.primary.main} iconStyles={iconStyles} alt={label}>{icon}</StyledIconWrapper>
      {isEmpty(state.selected) &&
      (<AsyncSelect
        value={state.selected}
        cacheOptions
        loadOptions={debounce(handleLoadOptions, 1000)}
        defaultOptions={[]}
        placeholder="Start typing to search..."
        onChange={handleOnChange}
        // isClearable
        loadingMessage={() => <StyledLoader />}
        noOptionsMessage={() => "No search results"}
        onFocus={handleOnFocus}
        // styles={selectStyles}
      />)
      }
  </StyledMediaSelectorWrapper>    );
}

export default AsyncSelectWrapper;