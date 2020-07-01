import "isomorphic-fetch";
import axios from "axios";
import React, { useEffect, useReducer, memo, useContext } from "react";
import AsyncSelect from "react-select/async";
import styled from "styled-components";
import debounce from "debounce-promise";
// import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import { FIREBASE_PROXY_URL } from "../Constants/api";
import chroma from "chroma-js";
import { useTheme, Theme } from "@material-ui/core/styles";
import firebase from "../FirebaseConfig";
import { useSession, SelectionContext } from "../Helpers/CustomHooks";
import { Typography, LinearProgress, Link } from "@material-ui/core";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Tooltip from "@material-ui/core/Tooltip";
import { User } from "firebase";
import { AdditionalRequest } from "../Types/common";
import { useHistory } from "react-router-dom";

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
        align-self: end; border-bottom: ${borderCommon}; border-right: ${borderCommon}; padding: 120px 40px 40px 120px`,
      "1,2": `justify-self: end;
        align-self: start; border-top: ${borderCommon}; border-right: ${borderCommon}; padding: 40px 40px 120px 120px`,
      "2,1": `justify-self: start;
        align-self: end; border-bottom: ${borderCommon}; border-left: ${borderCommon}; padding: 120px 120px 40px 40px`,
      "2,2": `justify-self: start;
        align-self: start; border-top: ${borderCommon}; border-left: ${borderCommon}; padding: 40px 120px 120px 40px`,
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
  justify-content: space-evenly;
`;

const StlyedActionIcon = styled.div`
  grid-row: 1;
  margin: 0 auto;
  cursor: pointer;
  svg {
    font-size: 32px;
  }
`;

const StyledTrashIconContainer = styled(StlyedActionIcon)`
  color: ${({ danger = "" }: StyleProps) => danger};
`;

const StyledExternalLinkIconContainer = styled(StlyedActionIcon)`
  & > a {
    color: ${({ primary = "" }: StyleProps) => primary};
  }
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
  dataFormatter?: (string) => string;
  searchParam?: string;
  schemaParser: any;
  icon: React.ReactElement;
  firestoreKey: string;
  quadrant: number[];
  externalUrlFormatter: (string) => string;
  additionalRequest?: AdditionalRequest;
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
      firestoreKey,
      quadrant,
      externalUrlFormatter,
      additionalRequest,
      publicUserId,
    } = props;

    const theme: Theme = useTheme();
    const user: User = useSession();
    const history = useHistory();
    const firestore = firebase.firestore();

    const { selections, setSelection }: any = useContext(SelectionContext);
    const selected = selections[firestoreKey] || {};
    const updateMatchesInDb = async (optionCopy) => {
      const mediaCollection = await firestore.collection("media");
      const matchFields = mediaCollection.doc(optionCopy?.id);

      matchFields.get().then((doc) => {
        if (!doc.exists) {
          // add match document if it doesnt exist already
          mediaCollection.doc(optionCopy?.id).set({
            title: optionCopy?.value?.title,
            currentlySelectedBy: [{ id: user.uid, email: user.email }],
          });
        } else {
          // otherwise append current uid to collection
          matchFields.update({
            currentlySelectedBy: [
              ...doc.data()!.currentlySelectedBy,
              { id: user.uid, email: user.email },
            ],
          });
        }
      });
    };

    const handleOnChange = async (selectedOption) => {
      const optionCopy = Object.assign({}, selectedOption, {
        id: `${firestoreKey}-${selectedOption?.value?.id}`,
      });
      // if we need to make a 2nd call to augment the user selection, do it on change
      // very igdb api specific
      if (!isEmpty(additionalRequest)) {
        const additionalResponse = await augmentWithAdditionalRequest(
          optionCopy?.value[additionalRequest!.matchFieldName]
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
      } = props.additionalRequest!;
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
      const { value: { image = "" } = {} } = selected;
      if (!isEmpty(selected)) return <img alt="media-cover" src={image} />;
      return <></>;
    };

    const getDecription = () => {
      const { value: { title = "", subtitle = "", id = "" } = {} } = selected;
      if (!isEmpty(selected)) {
        return (
          <StyledDescriptionContainer>
            <Typography component="h1" variant="h4">
              {/* TODO: change this to open recommendations */}
              <Link
                style={{ cursor: "pointer" }}
                onClick={() => history.push(`matches/${firestoreKey}`)}
              >
                {title}
              </Link>
            </Typography>
            <Typography component="h1" variant="h5">
              {subtitle}
            </Typography>
          </StyledDescriptionContainer>
        );
      }
    };

    const handleClear = async () => {
      const userFields = await firestore.collection("users").doc(user.uid);
      const matchFields = await firestore.collection("media").doc(selected.id);
      //remove uid from media collection
      matchFields.get().then((r) => {
        if (!r.exists) return;
        const oldArr = r.data()!.currentlySelectedBy;
        const newArr = oldArr.filter(({ id }) => id !== user.uid);
        matchFields.update({
          currentlySelectedBy: newArr,
        });
      });

      // remove media object from users collection
      userFields.update({
        [firestoreKey]: {},
      });
    };

    useEffect(() => {
      console.log("selections", selections);
    });

    useEffect(() => {
      if (user?.uid) {
        const listener = firebase
          .firestore()
          .collection("users")
          .doc(user?.uid)
          .onSnapshot((doc) => {
            const source = doc.metadata.hasPendingWrites;
            const selected = doc.data() && doc.data()![firestoreKey]; // TS needs ! to know data() is guaranteed to be method of doc
            return setSelection({ [firestoreKey]: selected });
          });
        // unsubscribe listener
        return () => listener();
      }
      if (publicUserId) {
        const publicUserRes = firebase
          .firestore()
          .collection("users")
          .doc(publicUserId)
          .get()
          .then((doc) => {
            const selected = doc.data() && doc.data()![firestoreKey];
            return setSelection({ [firestoreKey]: selected });
          });
      }
    }, [firestoreKey, user, publicUserId]);
    return (
      <StyledMediaSelectorWrapper
        quadrant={quadrant}
        primary={theme.palette.primary.main}
      >
        <StyledActionIconsContainer>
          {!isEmpty(selected) && !publicUserId && (
            <StyledTrashIconContainer
              danger={theme.palette.error.main}
              onClick={handleClear}
            >
              <Tooltip title="Delete">
                <HighlightOffOutlinedIcon />
              </Tooltip>
            </StyledTrashIconContainer>
          )}

          {!isEmpty(selected) && (
            <StyledExternalLinkIconContainer
              primary={theme.palette.primary.main}
            >
              <Tooltip title="Open in new tab">
                <a
                  href={externalUrlFormatter(selected)}
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon />
                </a>
              </Tooltip>
            </StyledExternalLinkIconContainer>
          )}
        </StyledActionIconsContainer>
        {getImage()}
        {getDecription()}
        {isEmpty(selected) && (
          <StyledAsyncSelectWrapper>
            <AsyncSelect
              value={selected}
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
