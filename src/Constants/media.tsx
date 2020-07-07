import React, { ReactElement } from "react";
import {
  omdbSchemaParser,
  googleBooksSchemaParser,
  igdbSchemaParser,
} from "../Helpers/SchemaParsers";
import { AdditionalRequest } from "../Types/common";
import { LiveTv, Theaters, SportsEsports, MenuBook } from "@material-ui/icons";
import imdbLogo from "../images/imdb.png";
import igdbLogo from "../images/igdb.png";
import googleBooksLogo from "../images/googlebooks.png";
import { Media } from "../Types/common";
export const MOVIE = "movie";
export const TV_SHOW = "tvShow";
export const GAME = "game";
export const BOOK = "book";

const omdbAdditionalRequest = {
  description: "fetch rating",
  matchFieldName: "id",
  url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}`,
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

export const media: Media[] = [
  {
    label: "Movie",
    icon: <Theaters />,
    quadrant: [1, 1],
    url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&type=movie`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: MOVIE,
    additionalRequest: omdbAdditionalRequest,
    externalUrlFormatter: (interpolatable): string =>
      `https://imdb.com/title/${interpolatable?.value?.id}`,
    ratingSource: {
      icon: imdbLogo,
      name: "IMDB",
      normalized: true,
    },
  },
  {
    label: "TV Show",
    icon: <LiveTv />,
    quadrant: [2, 1],
    url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&type=series`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: TV_SHOW,
    additionalRequest: omdbAdditionalRequest,
    externalUrlFormatter: (interpolatable): string =>
      `https://imdb.com/title/${interpolatable?.value?.id}`,
    ratingSource: {
      icon: imdbLogo,
      name: "IMDB",
      normalized: true,
    },
  },
  {
    label: "Book",
    icon: <MenuBook />,
    quadrant: [1, 2],
    url: `https://www.googleapis.com/books/v1/volumes?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}&projection=full&country=US`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "q",
    schemaParser: googleBooksSchemaParser,
    firestoreKey: BOOK,
    externalUrlFormatter: (interpolatable): string => {
      const isbn = interpolatable?.value?.isbn13;
      // AMAZON REFERRAL
      const refCode = "";
      return `https://amazon.com/s?k=${isbn}&ref=${refCode}`;
    },
    ratingSource: {
      icon: googleBooksLogo,
      name: "Google Books",
      normalized: false,
    },
  },
  {
    label: "Game",
    icon: <SportsEsports />,
    quadrant: [2, 2],
    url: "https://api-v3.igdb.com/games",
    method: "POST",
    headers: {
      "user-key": process.env.REACT_APP_IGDB_USER_KEY || "",
      Accept: "application/json",
    },
    schemaParser: igdbSchemaParser,
    firestoreKey: GAME,
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
        "user-key": process.env.REACT_APP_IGDB_USER_KEY || "",
        Accept: "application/json",
      },
    },
    externalUrlFormatter: (interpolatable): string =>
      interpolatable?.value?.url,
    ratingSource: {
      icon: igdbLogo,
      name: "IGDB (Twitch)",
      normalized: true,
    },
  },
];
