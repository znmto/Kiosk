import "isomorphic-fetch";
import axios from "axios";
import React, { useEffect, useReducer, memo } from "react";
import TextField from "@material-ui/core/TextField";
import AsyncSelect from "react-select/async";
import CircularProgress from "@material-ui/core/CircularProgress";
import styled from "styled-components";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import { FIREBASE_PROXY_URL } from "../Constants/api";
import chroma from "chroma-js";
import Loader from "./Loader";
import { useTheme } from "@material-ui/core/styles";
import firebase from "../FirebaseConfig";
import { useSession } from "../Helpers/CustomHooks";
import { Typography } from "@material-ui/core";
import { FaTrashAlt } from "react-icons/fa";

type StyleProps = {
  // x,y location of section in view
  quadrant?: number[];
  primary?: string;
  danger?: string;
  colors?: any;
};

const StyledMediaSelectorWrapper = styled.div`
  display: grid;
  margin: 0 auto;
  grid-column: ${({ quadrant = [] }: StyleProps) => quadrant[0]};
  grid-row: ${({ quadrant = [] }: StyleProps) => quadrant[1]};
  height: calc((100vh - 350px) / 2);
  align-content: center;
  justify-content: center;
  img {
    max-width: 250px;
    margin: 0 auto;
  }
  ${({ quadrant = [], primary }: StyleProps) =>
    quadrant[0] === 1 &&
    quadrant[1] === 1 &&
    `
      &::after {
      content: "";
      border: 1px solid ${primary};
      position: absolute;
      top: 25px;
      left: 300px;
      align-self: center;
      width: 200px;
      }
      `};
  ${({ quadrant = [], primary }: StyleProps) =>
    quadrant[0] === 2 &&
    quadrant[1] === 1 &&
    `
      &::before {
      content: "";
      border: 1px solid ${primary};
      position: absolute;
      top: 170px;
      right: 152px;
      align-self: center;
      width: 0px;
      height: 200px;
      }
      `};
` as any;

const StyledIconWrapper = styled.div`
  font-size: 32px;
  color: ${(props: StyleProps) => props.primary};
  text-align: center;
  position: absolute;
  ${({ quadrant = [] }: StyleProps) => {
    switch (quadrant.join()) {
      case "1,1": {
        return `left: 45%; top: 47%`;
      }
      case "1,2": {
        return `right: 45%;  top: 50%`;
      }
      case "2,1": {
        return `right: 45%; bottom: 46%`;
      }
      case "2,2": {
        return `left: 45%; bottom: 50%`;
      }
    }
  }};
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
  color: ${({ danger = "" }: StyleProps) => danger};
  cursor: pointer;
  font-size: 24px;
`;

const selectStyles = {
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    const color = "#000";
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
        ? "#ccc"
        : isSelected
        ? chroma.contrast(color, "white") > 2
          ? "white"
          : "black"
        : "#FFF",
      cursor: isDisabled ? "not-allowed" : "pointer",

      ":active": {
        ...styles[":active"],
        backgroundColor: !isDisabled && (isSelected ? color : color),
      },
    };
  },
  input: (styles) => ({ ...styles }),
  placeholder: (styles) => ({ ...styles }),
  singleValue: (styles, { data }) => ({ ...styles }),
};

const AsyncSelectWrapper: React.FC<any> = memo((props: any) => {
  const {
    label,
    url: apiUrl,
    headers,
    method,
    data,
    searchParam,
    schemaParser,
    icon,
    firestoreKey = "",
    quadrant = [],
    externalUrl = "",
    iconStyles = "",
    additionalRequest = {},
    publicUserId,
  } = props;
  const reducer = (state, payload) => ({ ...state, ...payload });

  const theme = useTheme();
  const user: any = useSession(); // TODO: fix type

  const firestore = firebase.firestore();
  const [state, dispatch] = useReducer(reducer, { selected: {} });

  const handleOnChange = async (selectedOption) => {
    const optionCopy = Object.assign({}, selectedOption);
    // if we need to make a 2nd call to augment the user selection, do it on change
    if (!isEmpty(additionalRequest)) {
      const additionalResponse = await augmentWithAdditionalRequest(
        optionCopy.value[additionalRequest?.matchFieldName]
      );
      console.log("additionalResponse", additionalResponse);
      const imageUrl = `https:${additionalResponse[0].url}`;
      console.log("imageUrl", imageUrl);
      optionCopy.value.image = imageUrl;
    }
    console.log("optionCopy", optionCopy);
    // get user data from DB
    const fields = await firestore.collection("users").doc(user.uid);
    // update field in DB
    const res = await fields.update({
      [firestoreKey]: optionCopy,
    });
  };

  const handleOnFocus = (_) => console.log("onFocus");

  const handleLoadOptions = (inputValue: string, callback) => {
    if (!inputValue) return callback([]);
    return callCloudFn(inputValue, callback);
  };

  const augmentWithAdditionalRequest = async (matchFieldName) => {
    const { url, data, method, headers, description } = props.additionalRequest;
    window.console.log(`additional request initated to ${description}`);
    try {
      const { data: response } = await axios({
        url: FIREBASE_PROXY_URL,
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          url,
          body: `where id = ${matchFieldName}; fields *;`,
          // body: data,
          method,
          headers,
        },
      });
      console.log("additional response", response);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  };

  const callCloudFn = async (maybeInput: string, callback) => {
    try {
      console.log("maybeInput", maybeInput);
      // add parameters to API url if necessary
      const parametrizedUrl = searchParam
        ? apiUrl.concat(`&${searchParam}=${maybeInput}`)
        : apiUrl;
      const { data: response, status } = await axios({
        url: FIREBASE_PROXY_URL,
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        data: {
          // api URL
          url: parametrizedUrl,
          // POST body
          body: data,
          // http verb
          method,
          headers,
        },
      });

      // use custom schema parsing function to manipulate API response data
      console.log("response", response);
      return callback(schemaParser(response));
    } catch (error) {
      console.log("error", error);
    }
  };

  const getImage = () => {
    const { selected: { value: { image = "" } = {} } = {} } = state;
    if (!isEmpty(state.selected)) return <img src={image} />;
    return <></>;
  };

  const getDecription = () => {
    const {
      selected: { value: { title = "", subtitle = "", id = "" } = {} } = {},
    } = state;
    if (!isEmpty(state.selected)) {
      return (
        <StyledDescriptionContainer>
          <Typography component="h1" variant="h4">
            <a href={`${externalUrl}${id}`} rel="noopener noreferrer">
              {title}
            </a>
          </Typography>
          <Typography component="h1" variant="h5">
            {subtitle}
          </Typography>
        </StyledDescriptionContainer>
      );
    }
  };

  const handleClear = async () => {
    const fields = await firestore.collection("users").doc(user.uid);
    // remove entry from DB
    await fields.update({
      [firestoreKey]: {},
    });
  };

  useEffect(() => {
    console.log("user?.uid", user?.uid);
    if (user?.uid) {
      const listener = firebase
        .firestore()
        .collection("users")
        .doc(user?.uid)
        .onSnapshot((doc) => {
          const source = doc.metadata.hasPendingWrites;
          const selected = doc.data() && doc.data()![firestoreKey]; // TS needs ! to know data() is guaranteed to be method of doc
          return dispatch({ selected });
        });
      // unsubscribe listener
      return () => listener();
    }
    if (publicUserId) {
      console.log("publicUserId", publicUserId);
      const publicActivityData = firebase
        .firestore()
        .collection("users")
        .doc(publicUserId)
        .get()
        .then((doc) => {
          const selected = doc.data() && doc.data()![firestoreKey];
          return dispatch({ selected });
        });
    }
  }, [firestoreKey, user, publicUserId]);

  return (
    <StyledMediaSelectorWrapper
      quadrant={quadrant}
      primary={theme.palette.primary.main}
    >
      {!isEmpty(state.selected) && !publicUserId && (
        <StyledTrashIconContainer
          danger={theme.palette.error.main}
          onClick={handleClear}
        >
          <FaTrashAlt />
        </StyledTrashIconContainer>
      )}
      {/* <h3>{label}</h3> */}
      {getImage()}
      {getDecription()}

      {isEmpty(state.selected) && (
        <AsyncSelect
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
        />
      )}
      <StyledIconWrapper
        primary={theme.palette.primary.main}
        quadrant={quadrant}
        alt={label}
      >
        {icon}
      </StyledIconWrapper>
    </StyledMediaSelectorWrapper>
  );
});

export default AsyncSelectWrapper;
