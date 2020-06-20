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
  console.log(
    "apiResponse",
    apiResponse.items[0].volumeInfo.industryIdentifiers[0]
  );
  return apiResponse.items.map(
    ({
      id,
      volumeInfo: {
        title,
        authors,
        publishedDate,
        imageLinks: { thumbnail: image },
        industryIdentifiers = [],
      },
    }) => ({
      label: `${title} (${authors?.[0]})`,
      value: {
        id,
        isbn13:
          industryIdentifiers.find((i) => i.type === "ISBN_13")?.identifier ||
          null,
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
  return apiResponse.map(
    ({ id, name: title, first_release_date, cover, url }) => ({
      label: `${title}`,
      value: {
        id,
        title,
        subtitle: new Date(first_release_date ?? 0 * 1000).getFullYear(),
        cover,
        type: "game",
        url,
      },
    })
  );
};
