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
    }) => ({
      label: `${title} (${subtitle})`,
      value: {
        id,
        title,
        subtitle,
        image,
        type,
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
        title,
        authors,
        publishedDate,
        imageLinks: { thumbnail: image },
      },
    }) => ({
      label: `${title} (${authors?.[0]})`,
      value: {
        id,
        title,
        subtitle: authors?.[0],
        image,
        type: "book",
      },
    })
  );
};

export const igdbSchemaParser = (apiResponse: IGDBGameArr) => {
  console.log("apiResponse", apiResponse);
  return apiResponse.map(({ id, name: title, first_release_date, cover }) => ({
    label: `${title}`,
    value: {
      id,
      title,
      subtitle: new Date(first_release_date ?? 0 * 1000).getFullYear(),
      cover,
      type: "game",
    },
  }));
};
