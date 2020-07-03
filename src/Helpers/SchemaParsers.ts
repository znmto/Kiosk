import {
  OMDBMovieArr,
  GoogleBooksArr,
  IGDBGameArr,
} from "../Types/ApiResponses";

export const omdbSchemaParser = (apiResponse: OMDBMovieArr) => {
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

export const googleBooksSchemaParser = (apiResponse: GoogleBooksArr) => {
  console.log("apiResponse", apiResponse);
  return apiResponse.items.map(
    ({
      id,
      volumeInfo: {
        title = "",
        authors = "",
        imageLinks: { thumbnail: image } = {},
        industryIdentifiers = [],
        publishedDate = "",
        averageRating = null,
      },
    }) => ({
      label: `${title} (${authors?.[0]})`,
      value: {
        id,
        isbn13:
          industryIdentifiers.find((i) => i.type === "ISBN_13")?.identifier ||
          null,
        title,
        subtitle: `${authors?.[0]}, ${publishedDate?.slice(0, 4)}`,
        image,
        type: "book",
        rating: averageRating,
      },
    })
  );
};

export const igdbSchemaParser = (apiResponse: IGDBGameArr) => {
  console.log("apiResponse", apiResponse);
  return apiResponse.map(
    ({ id, name: title, first_release_date = 0, cover, url, rating }) => ({
      label: `${title}`,
      value: {
        id,
        title,
        subtitle: new Date(first_release_date * 1000).getFullYear(),
        cover,
        type: "game",
        url,
        rating: rating ? (rating / 20).toFixed(1) : null,
      },
    })
  );
};
