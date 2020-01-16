import { OMDBMovieArr } from '../Types/ApiResponses';

export const omdbSchemaParser = (apiResponse: OMDBMovieArr) => {
    return apiResponse.Search.map(({ Title: title = '', Year: subtitle = '', Poster: image = '', imdbID: id = '', Type: type = '' }) => ({
        label: `${title} (${subtitle})`,
        value: {
            id,
            title,
            subtitle,
            image,
            type,
        }
    }))
}
