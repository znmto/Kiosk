import "isomorphic-fetch";
import axios from "axios";
import React, { useEffect, useReducer, memo } from "react";
import AsyncSelect from "react-select/async";
import styled from "styled-components";
import debounce from "debounce-promise";
// import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import { FIREBASE_PROXY_URL } from "../Constants/api";
import chroma from "chroma-js";
import { useTheme, Theme } from "@material-ui/core/styles";
import firebase from "../FirebaseConfig";
import { useSession } from "../Helpers/CustomHooks";
import { Typography, LinearProgress } from "@material-ui/core";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Tooltip from "@material-ui/core/Tooltip";
import { User } from "firebase";

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
    max-width: 225px;
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

const StyledLoader = styled(LinearProgress)`
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
  justify-content: space-around;
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

type AsyncSelectWrapper = {
  label: string;
  url: string;
  headers: any;
  method: string;
  data?: any;
  dataFormatter?: any;
  searchParam?: string;
  schemaParser: any;
  icon: React.ReactElement;
  firestoreKey: string;
  quadrant: number[];
  externalUrlFormatter: any;
  additionalRequest?: any;
  publicUserId?: string;
};

const AsyncSelectWrapper: React.FC<AsyncSelectWrapper> = memo(
  (props: AsyncSelectWrapper) => {
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

    const theme: Theme = useTheme();
    const user: User = useSession();

    const firestore = firebase.firestore();
    const [state, dispatch] = useReducer(reducer, {
      selected: {},
      previouslySelected: null,
    });

    const updateMatchesInDb = async (optionCopy) => {
      const collectionRef = await firestore.collection("media");
      const newDocRef = collectionRef.doc(optionCopy?.id);
      const oldDocRef = collectionRef.doc(state.previouslySelected);
      console.log("newDocRef", newDocRef);
      // add match document if it doesnt exist already
      newDocRef.get().then((doc) => {
        if (!doc.exists) {
          collectionRef.doc(optionCopy?.id).set({
            title: optionCopy?.value?.title,
            currentlySelectedBy: [user.uid],
          });
        } else {
          newDocRef.update({
            currentlySelectedBy: [...doc.data()!.currentlySelectedBy, user.uid],
          });
        }
      });

      //remove id from old collection
      oldDocRef.get().then((r) => {
        if (!r.exists) return;
        const oldArr = r.data()!.currentlySelectedBy;
        const newArr = oldArr.filter((id) => id !== user.uid);
        oldDocRef.update({
          currentlySelectedBy: newArr,
        });
      });
    };

    const handleOnChange = async (selectedOption) => {
      const optionCopy = Object.assign({}, selectedOption, {
        id: `${firestoreKey}-${selectedOption.value.id}`,
      });
      // if we need to make a 2nd call to augment the user selection, do it on change
      // very igdb api specific
      if (!isEmpty(additionalRequest)) {
        const additionalResponse = await augmentWithAdditionalRequest(
          optionCopy.value[additionalRequest?.matchFieldName]
        );
        const lowResImageUrl = additionalResponse[0].url;
        const highResImageUrl = lowResImageUrl.replace("t_thumb", "t_original");
        const imageUrl = `https:${highResImageUrl}`;
        console.log("imageUrl", imageUrl);
        optionCopy.value.image = imageUrl;
      }
      console.log("optionCopy", optionCopy);
      // get user data from DB
      const fields = await firestore.collection("users").doc(user.uid);
      console.log("fields", fields);

      // update field in DB
      await fields.update({
        [firestoreKey]: optionCopy,
      });
      window.console.log(">>>>>>>>>>>>>>>>>>>>>>>>>after");

      updateMatchesInDb(optionCopy);
    };

    const handleOnFocus = (_) => console.log("onFocus");

    const handleLoadOptions = (inputValue: string, callback) => {
      console.log("inputValue", inputValue);
      if (!inputValue) return callback([]);
      return callCloudFn(inputValue, callback);
    };

    const augmentWithAdditionalRequest = async (matchFieldName) => {
      const {
        url,
        data,
        method,
        headers,
        description,
      } = props.additionalRequest;
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
      if (!isEmpty(state.selected))
        return <img alt="media-cover" src={image} />;
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

      // //grab prev state
      // const prevFields = await fields.get();
      // console.log("prevFields", prevFields.data());
      // if (prevFields.exists) {
      //   dispatch({
      //     previouslySelected: prevFields.data()![firestoreKey].id,
      //   });
      // }

      // remove entry from DB
      dispatch({
        previouslySelected: state.selected.id,
      });
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
        const publicUserRes = firebase
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
              <Tooltip title="Delete">
                <HighlightOffOutlinedIcon />
              </Tooltip>
            </StyledTrashIconContainer>
            <StyledExternalLinkIconContainer
              primary={theme.palette.primary.main}
            >
              <Tooltip title="Open in new tab">
                <a
                  href={externalUrlFormatter(state.selected)}
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon />
                </a>
              </Tooltip>
            </StyledExternalLinkIconContainer>
          </StyledActionIconsContainer>
        )}
        {getImage()}
        {getDecription()}
        {isEmpty(state.selected) && (
          <StyledAsyncSelectWrapper>
            <AsyncSelect
              value={state.selected}
              // cacheOptions
              loadOptions={debounce(handleLoadOptions, 500, { leading: true })}
              defaultOptions={true}
              placeholder="Start typing to search..."
              onChange={handleOnChange}
              isClearable
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
  }
);

export default AsyncSelectWrapper;
