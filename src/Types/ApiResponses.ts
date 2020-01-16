export interface OMDBMovieArr {
    Search: OmdbMovie[];
};

interface OmdbMovie {
    Title: string;
    Year: string;
    Poster: string;
    imdbID: string;
    Type: string;
};