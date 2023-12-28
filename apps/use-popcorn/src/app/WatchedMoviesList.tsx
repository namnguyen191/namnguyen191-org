import { FC } from 'react';

import { UserWatchData } from './interfaces';

type WatchedMovieProps = {
  movie: UserWatchData;
  onDeleteWatched: (deletedId: string) => void;
};
const WatchedMovie: FC<WatchedMovieProps> = ({ movie, onDeleteWatched }) => {
  return (
    <>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span role="img" aria-label="imdb rating">
            ⭐️
          </span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span role="img" aria-label="user rating">
            🌟
          </span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span role="img" aria-label="runtime">
            ⏳
          </span>
          <span>{movie.Runtime}</span>
        </p>

        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
          X
        </button>
      </div>
    </>
  );
};

type WatchedMoviesListProps = {
  watched: UserWatchData[];
  onDeleteWatched: (deletedId: string) => void;
};
export const WatchedMoviesList: FC<WatchedMoviesListProps> = ({ watched, onDeleteWatched }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <li key={movie.imdbID}>
          <WatchedMovie movie={movie} onDeleteWatched={onDeleteWatched} />
        </li>
      ))}
    </ul>
  );
};
