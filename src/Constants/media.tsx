import React, { ReactHTMLElement, ReactNode, ReactElement } from "react";
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
import { IconBaseProps } from "react-icons/lib";
import { AdditionalRequest } from "../Types/common";

export type Media = {
  label: string;
  icon: ReactElement;
  quadrant: number[];
  url: string;
  method: string;
  headers: any;
  schemaParser: any;
  firestoreKey: string;
  searchParam?: string;
  dataFormatter?: (arg1: string) => string;
  additionalRequest?: AdditionalRequest;
  externalUrlFormatter: (arg1: any) => string;
};

export const media: Media[] = [
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
    url: `https://www.googleapis.com/books/v1/volumes?key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}&projection=full&country=US`,
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
      "user-key": process.env.REACT_APP_IGDB_USER_KEY || "",
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
        "user-key": process.env.REACT_APP_IGDB_USER_KEY || "",
        Accept: "application/json",
      },
    },
    externalUrlFormatter: (interpolatable): string =>
      interpolatable?.value?.url,
  },
];
