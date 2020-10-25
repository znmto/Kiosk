import React, { ReactElement } from "react";
import {
  omdbSchemaParser,
  googleBooksSchemaParser,
  igdbSchemaParser,
} from "../Helpers/SchemaParsers";
import { AdditionalRequest, InterpolatableObject } from "../Types/shared";
import { LiveTv, Theaters, SportsEsports, MenuBook } from "@material-ui/icons";
import imdbLogo from "../images/imdb.png";
import igdbLogo from "../images/igdb.png";
import googleBooksLogo from "../images/googlebooks.png";
import { Media } from "../Types/shared";
import {
  OMDBMovieArr,
  GoogleBooksArr,
  IGDBGameArr,
} from "../Types/ApiResponses";
export const MOVIE = "movie";
export const TV_SHOW = "tvShow";
export const GAME = "game";
export const BOOK = "book";

const omdbAdditionalRequest: AdditionalRequest = {
  description: "fetch rating",
  matchFieldName: "id",
  url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}`,
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

const igdbRequestMetadata = {
  tokenPreAuthUrl: process.env.REACT_APP_IGDB_TWITCH_OAUTH_URL,
  clientId: process.env.REACT_APP_TWITCH_CLIENT_ID,
  authService: "twitch",
};

export const media: Media[] = [
  {
    label: "Movie",
    icon: <Theaters />,
    quadrant: [1, 1], // I may have overthought this approach, but it works
    url: `http://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB_API_KEY}&type=movie`,
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    searchParam: "s",
    schemaParser: omdbSchemaParser,
    firestoreKey: MOVIE,
    additionalRequest: omdbAdditionalRequest,
    externalUrlFormatter: (
      interpolatable
    ): string =>  // format an external link to IMDB for this movie
      `https://imdb.com/title/${interpolatable?.value?.id}`,
    ratingSource: {
      icon: imdbLogo,
      name: "IMDB",
      normalized: true, // incoming rating is not /5
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
    externalUrlFormatter: (
      interpolatable: InterpolatableObject
    ): string =>  // format an external link to IMDB for this tv show
      `https://imdb.com/title/${interpolatable?.value?.id}`,
    ratingSource: {
      icon: imdbLogo,
      name: "IMDB",
      normalized: true, // incoming rating is not /5
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
    externalUrlFormatter: (interpolatable: InterpolatableObject): string => {
      const isbn = interpolatable?.value?.isbn13;
      const refCode = ""; // Amazon Referral? MONETIZATION!!!
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
    url: "https://api.igdb.com/v4/games",
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    schemaParser: igdbSchemaParser,
    firestoreKey: GAME,
    dataFormatter: (interpolatable: string): string => {
      // we need to format the body in a specific way for this api call
      const prefix: string = "search ";
      const postfix: string = " fields *;";
      return `${prefix}"${interpolatable}";${postfix}`;
    },
    additionalRequest: {
      description: "fetch cover art",
      matchFieldName: "cover",
      url: "https://api.igdb.com/v4/covers",
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      requestMetadata: igdbRequestMetadata,
    },
    externalUrlFormatter: (interpolatable: InterpolatableObject): string =>
      `${interpolatable?.value?.url}`,
    ratingSource: {
      icon: igdbLogo,
      name: "IGDB (Twitch)",
      normalized: true, // incoming rating is not /5
    },
    requestMetadata: igdbRequestMetadata,
  },
];
