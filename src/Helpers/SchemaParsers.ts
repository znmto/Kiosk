import {
  OMDBMovieArr,
  GoogleBooksArr,
  IGDBGameArr,
} from "../Types/ApiResponses";
import { round } from "lodash";
import {
  OMDBParsedData,
  GoogleBooksParsedData,
  IGDBParsedData,
  ParsedData,
} from "../Types/shared";

export const omdbSchemaParser = (
  apiResponse: OMDBMovieArr
): ParsedData<OMDBParsedData>[] => {
  return apiResponse.Search.map(
    ({
      Title: title = "",
      Year: subtitle = "",
      Poster: image = "",
      imdbID: id = "",
      Type: type = "",
      imdbRating = "",
    }) => ({
      label: `${title} (${subtitle})`,
      value: {
        id,
        title,
        subtitle,
        image,
        type,
        rating: imdbRating && round(imdbRating, 1),
      },
    })
  );
};

export const googleBooksSchemaParser = (
  apiResponse: GoogleBooksArr
): ParsedData<GoogleBooksParsedData>[] => {
  return apiResponse.items.map(
    ({
      id,
      volumeInfo: {
        title = "",
        authors = "",
        imageLinks: { thumbnail: image } = {},
        industryIdentifiers = [],
        publishedDate = "",
        averageRating = 0,
      },
    }) => ({
      label: `${title} (${authors?.[0]})`,
      value: {
        id,
        isbn13:
          industryIdentifiers.find((i) => i.type === "ISBN_13")?.identifier ||
          "",
        title,
        subtitle: `${authors?.[0]}, ${publishedDate?.slice(0, 4)}`,
        image,
        type: "book",
        rating: averageRating,
      },
    })
  );
};

export const igdbSchemaParser = (
  apiResponse: IGDBGameArr
): ParsedData<IGDBParsedData>[] => {
  return apiResponse.map(
    ({
      id,
      name: title,
      first_release_date = 0,
      cover = 0,
      url,
      rating = 0,
    }) => ({
      label: `${title}`,
      value: {
        id,
        title,
        subtitle: new Date(first_release_date * 1000).getFullYear(),
        cover,
        type: "game",
        url,
        rating: rating && round(rating / 20, 1),
      },
    })
  );
};
