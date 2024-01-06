import { FC, useEffect, useState } from 'react';

import { getMovieById } from './api';
import { ErrorMessage } from './ErrorMessage';
import { MovieData, UserWatchData } from './interfaces';
import { Loader } from './Loader';
import { StarRating } from './StarRating';

export type MovieDetailsProps = {
  watched: UserWatchData[];
  selectedId: string;
  onCloseMovie: () => void;
  onAddToWatched: (watched: UserWatchData) => void;
};

export const MovieDetails: FC<MovieDetailsProps> = ({
  watched,
  selectedId,
  onCloseMovie,
  onAddToWatched,
}) => {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  const isWatched = watched.map((m) => m.imdbID).includes(selectedId);
  const watchedUserRating = watched.find((m) => m.imdbID === selectedId)?.userRating;

  const handleAdd = (): void => {
    if (!movie || !userRating) return;

    const newWatchedMovie: UserWatchData = {
      ...movie,
      userRating,
    };

    onAddToWatched(newWatchedMovie);
    onCloseMovie();
  };

  useEffect(() => {
    const escapeKeyCb = (e: globalThis.KeyboardEvent): void => {
      if (e.code === 'Escape') {
        onCloseMovie();
      }
    };

    document.addEventListener('keydown', escapeKeyCb);

    return () => {
      document.removeEventListener('keydown', escapeKeyCb);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    const getMovieDetails = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const res = await getMovieById(selectedId);
        setMovie(res);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!movie?.Title) return;
    document.title = `Movie | ${movie.Title}`;

    return () => {
      document.title = 'usePopcorn';
    };
  }, [movie?.Title]);

  return (
    <div className="details">
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {movie && (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={movie.Poster} alt={`Poster of ${movie.Title} movie`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>
                {movie.Year} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span role="img" aria-label="stars rating icon">
                  ⭐️
                </span>
                {movie.imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating maxRating={10} size={24} onSetRating={(val) => setUserRating(val)} />
                  {userRating && userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating}{' '}
                  <span role="img" aria-label="star icon">
                    ⭐️
                  </span>
                </p>
              )}
            </div>
            <p>
              <em>{movie.Plot}</em>
            </p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
};
