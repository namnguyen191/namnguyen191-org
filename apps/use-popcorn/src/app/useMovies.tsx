import { useEffect, useState } from 'react';

import { findMovieByName } from './api';
import { MovieData } from './interfaces';

export function useMovies(query: string): {
  movies: MovieData[];
  isLoading: boolean;
  error: string | null;
} {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMovies = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await findMovieByName(query);

        if (res.Error) throw new Error('Something went wrong with fetching movies');

        setMovies(res.Search);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            console.log(err.message);
            setError(err.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (query.length === 0) {
      setMovies([]);
      setError(null);
      return;
    }

    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

  return { movies, isLoading, error };
}
