import React from "react";
import { useTheme } from "@material-ui/core/styles";
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
import { Input } from "@material-ui/core";

interface StyleProps {
  color?: string;
}

const StyledMediaSelectionWrapper = styled.div`
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
  margin: 0 auto;
`;

const media = [
  {
    label: "Movie",
    icon: <MdLocalMovies />,
    quadrant: [1, 1],
    iconStyles: "top: 47%; left: 46%; font-size: 32px",
    url: "http://www.omdbapi.com/?apikey=3b953286",
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: "movie",
    externalUrl: "https://imdb.com/title/",
  },
  {
    label: "TV Show",
    icon: <MdLiveTv />,
    quadrant: [2, 1],
    iconStyles: "top: 47%; left: 51.5%",
    url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: "tvShow",
    externalUrl: "https://imdb.com/title/",
  },
  {
    label: "Book",
    icon: <MdChromeReaderMode />,
    quadrant: [1, 2],
    iconStyles: "top: 53%; left: 46%",
    url: `https://www.googleapis.com/books/v1/volumes?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}&projection=lite`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "q",
    schemaParser: googleBooksSchemaParser,
    firestoreKey: "book",
    externalUrl: "",
  },
  {
    label: "Game",
    icon: <MdVideogameAsset />,
    quadrant: [2, 2],
    iconStyles: "top: 53%; left: 51.5%; font-size: 32px",
    url: "https://api-v3.igdb.com/games",
    method: "POST",
    headers: {
      "user-key": process.env.REACT_APP_IGDB_USER_KEY,
      Accept: "application/json",
    },
    // searchParam: "name",
    // prefixForDataString: "search ''"
    schemaParser: igdbSchemaParser,
    firestoreKey: "game",
    data: 'search "war"; fields *;',
    additionalRequest: {
      description: "fetch cover art",
      matchFieldName: "cover",
      url: "https://api-v3.igdb.com/covers",
      data: 'where id = "44920"; fields *;',
      method: "POST",
      headers: {
        "user-key": process.env.REACT_APP_IGDB_USER_KEY,
        Accept: "application/json",
      },
    },
  },
];

const Activity: React.FC = (props) => {
  const theme = useTheme();
  console.log("{process.env", process.env);
  console.log("{process.env", process.env);
  return (
    <>
      <StyledShareableLinkContainer>
        <Input readOnly value="test" />
      </StyledShareableLinkContainer>
      <StyledMediaSelectionWrapper>
        {/* <StyledCenteredDivider color={theme.palette.primary.main}><FaTimes/></StyledCenteredDivider> */}
        {media.map((m) => (
          <AsyncSelect key={m.label} {...m} />
        ))}
      </StyledMediaSelectionWrapper>
    </>
  );
};

export default Activity;
