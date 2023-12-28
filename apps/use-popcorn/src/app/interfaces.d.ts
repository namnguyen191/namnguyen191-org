export type UserWatchData = MovieData & {
  userRating: number;
};

export type MovieData = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  Genre: string;
  Plot: string;
  Actors: string;
  Director: string;
  imdbRating: number;
  Runtime: string;
};
