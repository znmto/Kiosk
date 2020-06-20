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
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

type StyleProps = {
  // x,y location of section in view
  quadrant?: number[];
  primary?: string;
  danger?: string;
  colors?: any;
};

const StyledMediaSelectorWrapper = styled.div`
  display: grid;
  grid-column: ${({ quadrant = [] }: StyleProps) => quadrant[0]};
  grid-row: ${({ quadrant = [] }: StyleProps) => quadrant[1]};
  height: calc((100vh - 350px) / 2);
  align-content: center;
  justify-content: center;
  img {
    max-width: 250px;
    margin: 0 auto;
  }
`;

const StyledIconWrapper = styled.div`
  font-size: 36px;
  color: ${(props: StyleProps) => props.primary};
  display: grid;
  position: absolute;
  ${({ quadrant = [] }: StyleProps): string => {
    const borderCommon = `1px solid #eee`;
    const quadStyleMap = {
      "1,1": `justify-self: end;
        align-self: end; border-bottom: ${borderCommon}; border-right: ${borderCommon}; padding: 120px 60px 60px 120px`,
      "1,2": `justify-self: end;
        align-self: start; border-top: ${borderCommon}; border-right: ${borderCommon}; padding: 60px 60px 120px 120px`,
      "2,1": `justify-self: start;
        align-self: end; border-bottom: ${borderCommon}; border-left: ${borderCommon}; padding: 120px 120px 60px 60px`,
      "2,2": `justify-self: start;
        align-self: start; border-top: ${borderCommon}; border-left: ${borderCommon}; padding: 60px 120px 120px 60px`,
    };
    return quadStyleMap[quadrant.join()];
  }};
` as any;

const StyledLoader = styled(Loader)`
  margin: 0 auto;
  display: inline-block;
`;
const StyledAsyncSelectWrapper = styled.div`
  width: 300px;
`;
const StyledDescriptionContainer = styled.div`
  text-align: center;
  margin-top: 15px;
  & a {
    text-decoration: none;
    color: unset;
  }
`;

const StyledActionIconsContainer = styled.div`
  display: grid;
  justify-content: space-between;
`;

const StyledTrashIconContainer = styled.div`
  color: ${({ danger = "" }: StyleProps) => danger};
  grid-row: 1;
  cursor: pointer;
  font-size: 24px;
`;

const StyledExternalLinkIconContainer = styled.div`
  & > a {
    color: ${({ primary = "" }: StyleProps) => primary};
  }
  grid-row: 1;
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
    dataFormatter,
    searchParam,
    schemaParser,
    icon,
    firestoreKey = "",
    quadrant = [],
    externalUrlFormatter,
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
      // custom format data if necessary
      const postData = dataFormatter ? dataFormatter(maybeInput) : data;
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
          url: parametrizedUrl, // api URL
          body: postData, // POST body
          method, // http verb
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
            {/* TODO: change this to open recommendations */}
            <a
              href={
                // `${externalUrl}${id}`
                externalUrlFormatter(state.selected)
              }
              rel="noopener noreferrer"
            >
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
        <StyledActionIconsContainer>
          <StyledTrashIconContainer
            danger={theme.palette.error.main}
            onClick={handleClear}
          >
            <HighlightOffOutlinedIcon />
          </StyledTrashIconContainer>
          <StyledExternalLinkIconContainer primary={theme.palette.primary.main}>
            <a
              href={externalUrlFormatter(state.selected)}
              rel="noopener noreferrer"
            >
              <OpenInNewIcon />
            </a>
          </StyledExternalLinkIconContainer>
        </StyledActionIconsContainer>
      )}
      {/* <h3>{label}</h3> */}
      {getImage()}
      {getDecription()}
      {isEmpty(state.selected) && (
        <StyledAsyncSelectWrapper>
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
        </StyledAsyncSelectWrapper>
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
