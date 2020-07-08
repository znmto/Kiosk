import {
  OMDBMovieArr,
  GoogleBooksArr,
  IGDBGameArr,
} from "../Types/ApiResponses";

interface ParsedData<T> {
  label: string;
  value: T;
}

type OMDBParsedData = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: string;
  rating: number;
};
type GoogleBooksParsedData = {
  id: string;
  isbn13?: string;
  title: string;
  subtitle: string;
  image?: string;
  type: string;
  rating: number;
};
type IGDBParsedData = {
  id: number;
  title: string;
  subtitle: number;
  cover: number;
  url: string;
  type: string;
  rating: string;
};

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
        rating: parseFloat(imdbRating),
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
  console.log("apiResponse", apiResponse);
  return apiResponse.map(
    ({ id, name: title, first_release_date = 0, cover = 0, url, rating }) => ({
      label: `${title}`,
      value: {
        id,
        title,
        subtitle: new Date(first_release_date * 1000).getFullYear(),
        cover,
        type: "game",
        url,
        rating: rating ? (rating / 20).toFixed(1) : "",
      },
    })
  );
};
