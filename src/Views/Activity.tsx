import React, { memo, useState, useEffect } from "react";
import axios from "axios";
import { useTheme, Theme } from "@material-ui/core/styles";
import styled from "styled-components";
import AsyncSelect from "../Components/AsyncSelect";
import {
  omdbSchemaParser,
  googleBooksSchemaParser,
  igdbSchemaParser,
} from "../Helpers/SchemaParsers";
import {
  MdLiveTv,
  MdLocalMovies,
  MdVideogameAsset,
  MdChromeReaderMode,
} from "react-icons/md";
import { useSession } from "../Helpers/CustomHooks";
import { FIREBASE_GET_ID_URL } from "../Constants/api";
import { User } from "firebase";
import ClipBoardCopy from "../Components/CopyToClipboard";

type StyleProps = {
  color?: string;
};

type PublicUser = {
  email: string;
  uid: string;
};

const StyledMediaSelectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-evenly;
`;
const StyledPublicUserInfo = styled.h2`
  display: grid;
  justify-content: center;
`;

const StyledCenteredDivider = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: rotate(45deg) translate(-50%, 25%);
  color: ${(props: StyleProps) => props.color};
  font-size: 40px;
  font-weight: 100;
  & svg {
    stroke-width: 0.2;
  }
`;

const StyledShareableLinkContainer = styled.div`
  display: grid;
  justify-content: center;
  padding: 40px 0 20px;
  & input {
    width: 300px;
    padding: 5px;
  }
`;

const media = [
  {
    label: "Movie",
    icon: <MdLocalMovies />,
    quadrant: [1, 1],
    url: "http://www.omdbapi.com/?apikey=3b953286",
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: "movie",
    externalUrlFormatter: (interpolatable): string =>
      `https://imdb.com/title/${interpolatable?.value?.id}`,
  },
  {
    label: "TV Show",
    icon: <MdLiveTv />,
    quadrant: [2, 1],
    url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: "tvShow",
    externalUrlFormatter: (interpolatable): string =>
      `https://imdb.com/title/${interpolatable?.value?.id}`,
  },
  {
    label: "Book",
    icon: <MdChromeReaderMode />,
    quadrant: [1, 2],
    url: `https://www.googleapis.com/books/v1/volumes?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}&projection=full`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "q",
    schemaParser: googleBooksSchemaParser,
    firestoreKey: "book",
    externalUrlFormatter: (interpolatable): string => {
      const isbn = interpolatable?.value?.isbn13;
      // AMAZON REFERRAL
      const refCode = "";
      return `https://amazon.com/s?k=${isbn}&ref=${refCode}`;
    },
  },
  {
    label: "Game",
    icon: <MdVideogameAsset />,
    quadrant: [2, 2],
    url: "https://api-v3.igdb.com/games",
    method: "POST",
    headers: {
      "user-key": process.env.REACT_APP_IGDB_USER_KEY,
      Accept: "application/json",
    },
    schemaParser: igdbSchemaParser,
    firestoreKey: "game",
    dataFormatter: (interpolatable: string): string => {
      const prefix: string = "search ";
      const postfix: string = " fields *;";
      return `${prefix}"${interpolatable}";${postfix}`;
    },
    additionalRequest: {
      description: "fetch cover art",
      matchFieldName: "cover",
      url: "https://api-v3.igdb.com/covers",
      method: "POST",
      headers: {
        "user-key": process.env.REACT_APP_IGDB_USER_KEY,
        Accept: "application/json",
      },
    },
    externalUrlFormatter: (interpolatable): string =>
      interpolatable?.value?.url,
  },
];

interface ActivityProps {
  match?: any;
}

const Activity: React.FC<ActivityProps> = memo((props: ActivityProps) => {
  const { match: { params = {} } = {} } = props;
  const [publicUser, setPublicUser] = useState<PublicUser>();
  const theme: Theme = useTheme();
  const user: User = useSession();

  const getUserNamesById = async (userIdArr: string[]) => {
    console.log("userIdArr", userIdArr);
    const userIdParam = userIdArr.join(",");
    try {
      const { data } = await axios({
        url: FIREBASE_GET_ID_URL,
        method: "GET",
        params: {
          ids: userIdParam,
        },
      });
      console.log("data", data);
      const publicUser: PublicUser = data[0];
      return setPublicUser(publicUser);
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    !user && getUserNamesById([params?.uid]);
  }, []);
  console.log("window.location", window.location);
  return (
    <>
      {user ? (
        <StyledShareableLinkContainer>
          <ClipBoardCopy />
        </StyledShareableLinkContainer>
      ) : (
        <StyledPublicUserInfo>{`${publicUser?.email}'s List`}</StyledPublicUserInfo>
      )}
      <StyledMediaSelectionWrapper>
        {/* <StyledCenteredDivider color={theme.palette.primary.main}><FaTimes/></StyledCenteredDivider> */}
        {media.map((m) => (
          <AsyncSelect publicUserId={params?.uid} key={m.label} {...m} />
        ))}
      </StyledMediaSelectionWrapper>
    </>
  );
});

export default Activity;
