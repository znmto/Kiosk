import "isomorphic-fetch";
import { BOOK, GAME, MOVIE, TV_SHOW } from "../Constants/media";
import {
  Grid,
  Grow,
  LinearProgress,
  Link,
  Typography,
} from "@material-ui/core";
import React, {
  ReactElement,
  memo,
  useState,
  useContext,
  useEffect,
} from "react";
import { SelectionContext, useSession } from "../Helpers/CustomHooks";
import { Theme, useTheme } from "@material-ui/core/styles";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
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
import isEmpty from "lodash/isEmpty";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

type StyleProps = {
  // x,y location of section in view
  quadrant?: number[];
  primary?: string;
  danger?: string;
  colors?: string;
};

const StyledArrowDownwardIcon = styled(ArrowDownwardIcon)`
  font-size: 72px !important;
  color: ${({ primary = "" }: StyleProps) => primary};
`;

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
  & svg {
    font-size: 32px;
  }
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

type AdditionalAsyncSelectProps = {
  publicUserId?: string;
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
    } = props;

    const theme: Theme = useTheme();
    const user: User = useSession();
    const history = useHistory();
    const firestore = firebase.firestore();

    const { selections, setSelection, setMetadata, metadata }: any = useContext(
      SelectionContext
    );
    const selected = selections[firestoreKey] || {};

    const [loading, setLoading] = useState<boolean>(false);

    const updateMatchesInDb = async (optionCopy) => {
      try {
        const mediaCollection = await firestore.collection("media");
        const matchFields = mediaCollection.doc(optionCopy?.id);
        const {
          user: { avatar = "", fullName = "" },
        } = metadata;
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
      // if we need to make a 2nd call to augment the user selection, do it on change
      // api specific
      try {
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
          }
        }
        // get user data from DB
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
            body: postData, // POST body
            method, // http verb
            headers,
          },
        });
        // use custom schema parsing function to manipulate API response data
        return callback(schemaParser(response));
      } catch (error) {
        console.log("callCloudFn error", error);
      }
    };

    const getImage = (): ReactElement => {
      const { value: { image = "" } = {} } = selected;
      if (!isEmpty(selected)) return <img alt="media-cover" src={image} />;
      return <></>;
    };

    const getDecription = (): ReactElement => {
      const StyledRatingSourceIconWrapper = styled.div`
        display: inline-block;
        margin-left: 15px;
        img {
          width: 50px;
        }
      `;
      const {
        value: { title = "", subtitle = "", id = "", rating = null } = {},
      } = selected;
      const { icon, name, normalized } = ratingSource;
      if (!isEmpty(selected)) {
        return (
          <StyledDescriptionContainer>
            <Typography variant="h5">
              <Link
                style={{ cursor: publicUserId ? "initial" : "pointer" }}
                onClick={() =>
                  !publicUserId && history.push(`matches/${firestoreKey}`)
                }
              >
                {title}
              </Link>
            </Typography>
            <Typography variant="body1">{subtitle}</Typography>
            {rating && (
              <>
                <Grid container direction="column">
                  <Grid item>
                    <Rating
                      name="read-only"
                      value={rating}
                      precision={0.1}
                      size="large"
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
      //remove uid from media collection
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

    useEffect(() => {
      setLoading(true);
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
          })
          .catch((e) => console.log("get public user error", e))
          .finally(() => setLoading(false));
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
            setLoading(false);
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
              alt={label}
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
