export interface OMDBMovieArr {
  Search: OmdbMovie[];
}

interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings?: RatingsEntity[] | null;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}
interface RatingsEntity {
  Source: string;
  Value: string;
}

export interface GoogleBooksArr {
  items: GoogleBook[];
}

interface GoogleBook {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: VolumeInfo;
  saleInfo: SaleInfo;
  accessInfo: AccessInfo;
  searchInfo: SearchInfo;
}

interface AccessInfo {
  country: string;
  epub: Epub;
  pdf: PDF;
  accessViewStatus: string;
}

interface Epub {
  isAvailable: boolean;
  acsTokenLink: string;
}

interface PDF {
  isAvailable: boolean;
}

interface SaleInfo {
  country: string;
  listPrice: SaleInfoListPrice;
  retailPrice: SaleInfoListPrice;
  buyLink: string;
  offers: Offer[];
}

interface SaleInfoListPrice {
  amount: number;
  currencyCode: string;
}

interface Offer {
  finskyOfferType: number;
  listPrice: OfferListPrice;
  retailPrice: OfferListPrice;
  giftable: boolean;
}

interface OfferListPrice {
  amountInMicros: number;
  currencyCode: string;
}

interface SearchInfo {
  textSnippet: string;
}

interface VolumeInfo {
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  readingModes: ReadingModes;
  maturityRating: string;
  allowAnonLogging: boolean;
  contentVersion: string;
  averageRating: number;
  panelizationSummary: PanelizationSummary;
  imageLinks: ImageLinks;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
  industryIdentifiers: any;
}

interface ImageLinks {
  smallThumbnail: string;
  thumbnail: string;
}

interface PanelizationSummary {
  containsEpubBubbles: boolean;
  containsImageBubbles: boolean;
}

interface ReadingModes {
  text: boolean;
  image: boolean;
}

export interface IGDBGameArr extends Array<IGDBGame> {}

export interface IGDBGame {
  id: number;
  alternative_names?: number[];
  category: number;
  cover?: number;
  created_at: number;
  first_release_date?: number;
  game_modes?: number[];
  genres?: number[];
  involved_companies?: number[];
  keywords?: number[];
  name: string;
  parent_game?: number;
  platforms?: number[];
  player_perspectives?: number[];
  popularity: number;
  pulse_count?: number;
  release_dates?: number[];
  screenshots?: number[];
  similar_games?: number[];
  slug: string;
  summary?: string;
  tags?: number[];
  themes?: number[];
  updated_at: number;
  url: string;
  websites?: number[];
  external_games?: number[];
  age_ratings?: number[];
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  collection?: number;
  franchise?: number;
  franchises?: number[];
  rating?: number;
  rating_count?: number;
  total_rating?: number;
  total_rating_count?: number;
  videos?: number[];
  version_parent?: number;
  version_title?: string;
  game_engines?: number[];
  status?: number;
  bundles?: number[];
}
