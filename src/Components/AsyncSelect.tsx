import "isomorphic-fetch";
import axios from "axios";
import React, { useEffect, memo, useContext, ReactElement } from "react";
import AsyncSelect from "react-select/async";
import styled from "styled-components";
import debounce from "debounce-promise";
import isEmpty from "lodash/isEmpty";
import { FIREBASE_PROXY_URL } from "../Constants/api";
import chroma from "chroma-js";
import { useTheme, Theme } from "@material-ui/core/styles";
import firebase from "../FirebaseConfig";
import { useSession, SelectionContext } from "../Helpers/CustomHooks";
import { Typography, LinearProgress, Link } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Tooltip from "@material-ui/core/Tooltip";
import { User } from "firebase";
import { AdditionalRequest } from "../Types/common";
import { useHistory } from "react-router-dom";
import { TV_SHOW, MOVIE, GAME, BOOK } from "../Constants/media";

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
  height: calc((100vh - 320px) / 2);
  align-content: center;
  justify-content: center;
  img {
    max-width: 200px;
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
  justify-content: center;
  > div {
    margin: 0 10px;
  }
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

    const { selections, setSelection, setMetadata, metadata }: any = useContext(
      SelectionContext
    );
    const selected = selections[firestoreKey] || {};
    const updateMatchesInDb = async (optionCopy) => {
      const mediaCollection = await firestore.collection("media");
      const matchFields = mediaCollection.doc(optionCopy?.id);
      const {
        user: { avatar = "", fullName = "" },
      } = metadata;
      matchFields.get().then((doc) => {
        console.log("metadata", metadata);
        if (!doc.exists) {
          // add match document if it doesnt exist already
          mediaCollection.doc(optionCopy?.id).set({
            title: optionCopy?.value?.title,
            currentlySelectedBy: [
              { id: user.uid, email: user.email, avatar, fullName },
            ],
          });
        } else {
          // otherwise append current uid to collection
          matchFields.update({
            currentlySelectedBy: [
              ...doc.data()!.currentlySelectedBy,
              { id: user.uid, email: user.email, avatar, fullName },
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
      // api specific
      if (!isEmpty(additionalRequest)) {
        const {
          url: additionalRequestUrl,
          matchFieldName,
        } = additionalRequest!;
        if (firestoreKey === GAME) {
          const additionalResponse = await augmentWithAdditionalRequest({
            customUrl: additionalRequestUrl,
            customBody: `where id = ${optionCopy?.value[matchFieldName]}; fields *;`,
          });
          const lowResImageUrl = additionalResponse[0].url;
          const highResImageUrl = lowResImageUrl.replace(
            "t_thumb",
            "t_original"
          );
          const imageUrl = `https:${highResImageUrl}`;
          optionCopy.value.image = imageUrl;
        }
        if ([MOVIE, TV_SHOW].includes(firestoreKey)) {
          const additionalResponse = await augmentWithAdditionalRequest({
            customUrl: `${additionalRequestUrl}&i=${optionCopy?.value[matchFieldName]}`,
          });
          const normalizedRating =
            parseFloat(additionalResponse?.imdbRating) / 2;
          optionCopy.value.rating = normalizedRating;
          console.log("additionalResponse", additionalResponse);
        }
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
      if (!inputValue) return callback([]);
      return callCloudFn(inputValue, callback);
    };

    const augmentWithAdditionalRequest = async ({
      customBody = {},
      customUrl,
    }: {
      customBody?: any;
      customUrl: string;
    }) => {
      const { method, headers, description } = props.additionalRequest!;
      console.log("customBody, customUrl", customBody, customUrl);
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
            url: customUrl,
            ...(!isEmpty(customBody) ? { body: customBody } : {}),
            method,
            headers,
          },
        });
        console.log("additional response", response);
        return response;
      } catch (error) {
        console.log("error", error);
      }
    };

    const callCloudFn = async (maybeInput: string, callback) => {
      try {
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

    const getImage = (): ReactElement => {
      const { value: { image = "" } = {} } = selected;
      if (!isEmpty(selected)) return <img alt="media-cover" src={image} />;
      return <></>;
    };

    const getDecription = (): ReactElement => {
      const {
        value: { title = "", subtitle = "", id = "", rating = null } = {},
      } = selected;
      if (!isEmpty(selected)) {
        return (
          <StyledDescriptionContainer>
            <Typography variant="h5">
              <Link
                style={{ cursor: "pointer" }}
                onClick={() => history.push(`matches/${firestoreKey}`)}
              >
                {title}
              </Link>
            </Typography>
            <Typography variant="h6">{subtitle}</Typography>
            {rating && (
              <>
                <Rating
                  name="read-only"
                  value={rating}
                  precision={0.1}
                  size="large"
                  readOnly
                />
                <Typography>{rating} / 5</Typography>
              </>
            )}
          </StyledDescriptionContainer>
        );
      }
      return <></>;
    };

    const handleClear = async () => {
      const userFields = await firestore.collection("users").doc(user.uid);
      console.log("selected", selected);
      const matchFields = await firestore.collection("media").doc(selected?.id);
      //remove uid from media collection
      matchFields.get().then((doc) => {
        console.log("doc", doc);
        if (!doc.exists) return;
        console.log("doc.data()", doc.data());
        const oldArr = doc.data()!.currentlySelectedBy;
        console.log("oldArr", oldArr);
        const newArr = oldArr.filter(({ id }) => id !== user.uid);
        console.log("newArr", newArr);
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
      if (publicUserId) {
        const publicUserRes = firebase
          .firestore()
          .collection("users")
          .doc(publicUserId)
          .get()
          .then((doc) => {
            if (isEmpty(metadata.publicUser) && doc.data()) {
              const {
                metadata: { avatar, fullName },
              } = doc.data()!;
              setMetadata({ publicUser: { fullName, avatar } });
            }
            const selected = doc.data() && doc.data()![firestoreKey];
            return setSelection({ [firestoreKey]: selected });
          });
      } else if (user?.uid) {
        const listener = firebase
          .firestore()
          .collection("users")
          .doc(user?.uid)
          .onSnapshot((doc) => {
            console.log("doc", doc.data());
            if (isEmpty(metadata.user) && doc.data()) {
              const {
                metadata: { avatar, fullName },
              } = doc.data()!;
              setMetadata({ user: { fullName, avatar } });
            }
            const selected = doc.data() && doc.data()![firestoreKey];
            return setSelection({ [firestoreKey]: selected });
          });
        // unsubscribe listener
        return () => listener();
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
