import "isomorphic-fetch";
import { BOOK, GAME, MOVIE, TV_SHOW } from "../Constants/media";
import { Grid, Grow, Link, Typography } from "@material-ui/core";
import React, { ReactElement, memo, useContext } from "react";
import { SelectionContext, useSession } from "../Helpers/CustomHooks";
import { Theme, useTheme } from "@material-ui/core/styles";
import AsyncSelect from "react-select/async";
import { FIREBASE_PROXY_URL } from "../Constants/api";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import { Media } from "../Types/shared";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Rating from "@material-ui/lab/Rating";
import Tooltip from "@material-ui/core/Tooltip";
import CircularProgress from "@material-ui/core/CircularProgress";
import { User } from "firebase";
import axios from "axios";
import debounce from "debounce-promise";
import firebase from "../FirebaseConfig";
import { isEmpty, round } from "lodash";
import { useHistory } from "react-router-dom";
import { FirestoreContext } from "../Helpers/CustomHooks";
import {
  StyledArrowDownwardIcon,
  StyledMediaSelectorWrapper,
  StyledIconWrapper,
  StyledLoader,
  StyledAsyncSelectWrapper,
  StyledDescriptionContainer,
  StyledActionIconsContainer,
  StlyedActionIcon,
  StyledTrashIconContainer,
  StyledExternalLinkIconContainer,
  StyledSubtitle,
  StyledRatingSourceIconWrapper,
} from "./AsyncSelectStyles";

type AdditionalAsyncSelectProps = {
  publicUserId?: string;
  loading: boolean;
};
type AsyncSelectProps = Media & AdditionalAsyncSelectProps;

const AsyncSelectProps: React.FC<AsyncSelectProps> = memo(
  (props: AsyncSelectProps) => {
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
      ratingSource,
      loading,
    } = props;

    const theme: Theme = useTheme();
    const user: User = useSession();
    const history = useHistory();
    const firestore = firebase.firestore();

    const { selections = {}, metadata = {} }: FirestoreContext = useContext(
      SelectionContext
    );
    const selected = selections![firestoreKey] || {};

    const updateMatchesInDb = async (optionCopy) => {
      try {
        const mediaCollection = await firestore.collection("media");
        const matchFields = mediaCollection.doc(optionCopy?.id);
        const { user: { avatar = "", fullName = "" } = {} } = metadata;
        matchFields.get().then((doc) => {
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
      } catch (error) {
        console.log("updateMatchesInDb error", error);
      }
    };

    const handleOnChange = async (selectedOption) => {
      const optionCopy = Object.assign({}, selectedOption, {
        id: `${firestoreKey}-${selectedOption?.value?.id}`,
      });
      try {
        // if we need to make a 2nd call to augment the user selection, do it on change without mutating original object
        if (!isEmpty(additionalRequest)) {
          const {
            url: additionalRequestUrl,
            matchFieldName,
          } = additionalRequest!;
          if (firestoreKey === GAME) {
            // for IGDB we need to fetch cover art in a seperate request
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
            // for OMDB we need to fetch rating in a seperate request
            const additionalResponse = await augmentWithAdditionalRequest({
              customUrl: `${additionalRequestUrl}&i=${optionCopy?.value[matchFieldName]}`,
            });
            // IMDB ratings are out of 10
            const normalizedRating = round(
              parseFloat(additionalResponse?.imdbRating) / 2,
              1
            );
            optionCopy.value.rating = normalizedRating;
          }
        }
        // grab user document
        const fields = await firestore.collection("users").doc(user.uid);
        // update field in DB
        await fields.update({
          [firestoreKey]: optionCopy,
        });
      } catch (error) {
        console.log("handleOnChange error", error);
      }

      updateMatchesInDb(optionCopy);
    };

    const handleOnFocus = (_) => console.log("onFocus"); // for later use

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
      // just a simple extra call to our CORS Cloud Function to get additional data when needed
      const { method, headers, description } = props.additionalRequest!;
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
        return response;
      } catch (error) {
        console.log(
          `augmentWithAdditionalRequest for ${description} error`,
          error
        );
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
        const { data: response } = await axios({
          url: FIREBASE_PROXY_URL,
          method: "POST",
          headers: {
            "Content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          data: {
            url: parametrizedUrl, // api URL
            body: postData, // api POST body
            method, // api verb
            headers,
          },
        });
        // use individual custom schema parsing function to massage API response data
        return callback(schemaParser(response));
      } catch (error) {
        console.log("callCloudFn error", error);
      }
    };

    const getImage = (): ReactElement => {
      const { value: { image = "" } = {} } = selected;
      if (!isEmpty(selected))
        return <img className="media-cover" alt="media-cover" src={image} />;
      return <></>;
    };

    const getDecription = (): ReactElement => {
      const {
        value: { title = "", subtitle = "", id = "", rating = null } = {},
      } = selected;
      const { icon, name, normalized } = ratingSource;
      if (!isEmpty(selected)) {
        return (
          <StyledDescriptionContainer>
            <Typography variant="h5" display="inline">
              <Link
                style={{ cursor: publicUserId ? "initial" : "pointer" }}
                onClick={() =>
                  !publicUserId && history.push(`matches/${firestoreKey}`)
                }
              >
                {title}
              </Link>
            </Typography>
            <StyledSubtitle paragraph variant="body1" display="inline">
              ({subtitle})
            </StyledSubtitle>
            {rating && (
              <>
                <Grid container direction="column">
                  <Grid item>
                    <Rating
                      name="read-only"
                      value={rating}
                      precision={0.1}
                      readOnly
                    />
                  </Grid>
                  <Grid item container justify="center">
                    <Typography>{rating} / 5</Typography>
                    <Tooltip
                      placement="bottom"
                      title={
                        <Typography variant="body2">
                          {`${normalized ? "Normalized from " : ""}${name}`}
                        </Typography>
                      }
                    >
                      <StyledRatingSourceIconWrapper>
                        <img src={icon} alt="rating source icon" />
                      </StyledRatingSourceIconWrapper>
                    </Tooltip>
                  </Grid>
                </Grid>
              </>
            )}
          </StyledDescriptionContainer>
        );
      }
      if (!publicUserId) {
        return (
          <Grid container direction="column" alignItems="center">
            <Grid item>
              <Typography variant="h5">{`Search for a ${label} below`}</Typography>
            </Grid>
            <Grow in style={{ transformOrigin: "0 0 0" }} timeout={3000}>
              <Grid item>
                <StyledArrowDownwardIcon primary={theme.palette.primary.main} />
              </Grid>
            </Grow>
          </Grid>
        );
      }
      return <></>;
    };

    const handleClear = async () => {
      const userFields = await firestore.collection("users").doc(user.uid);
      const matchFields = await firestore.collection("media").doc(selected?.id);
      // remove user id from media collection
      matchFields.get().then((doc) => {
        if (!doc.exists) return;
        const oldArr = doc.data()!.currentlySelectedBy;
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

    return (
      <StyledMediaSelectorWrapper
        quadrant={quadrant}
        primary={theme.palette.primary.main}
      >
        {loading ? (
          <CircularProgress style={{ color: "#325247" }} size={60} />
        ) : (
          <>
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
            {isEmpty(selected) && !publicUserId && (
              <StyledAsyncSelectWrapper>
                <AsyncSelect
                  value={selected}
                  // cacheOptions
                  loadOptions={debounce(handleLoadOptions, 500, {
                    leading: true,
                  })}
                  defaultOptions={true}
                  placeholder="Start typing to search..."
                  onChange={handleOnChange}
                  isClearable
                  loadingMessage={() => <StyledLoader />}
                  noOptionsMessage={() => "No search results"}
                  onFocus={handleOnFocus}
                />
              </StyledAsyncSelectWrapper>
            )}
            <StyledIconWrapper
              primary={theme.palette.primary.main}
              quadrant={quadrant}
            >
              {icon}
            </StyledIconWrapper>
          </>
        )}
      </StyledMediaSelectorWrapper>
    );
  }
);

export default AsyncSelectProps;
