import { FC } from 'react';

import { MovieData } from './interfaces';

type MovieProps = {
  movie: MovieData;
};
const Movie: FC<MovieProps> = ({ movie }) => {
  return (
    <>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </>
  );
};

export type MoviesListProps = {
  movies: MovieData[];
  onMovieSelected: (id: string) => void;
};
export const MoviesList: FC<MoviesListProps> = ({ movies, onMovieSelected }) => {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <li onClick={() => onMovieSelected(movie.imdbID)} key={movie.imdbID}>
          <Movie movie={movie} />
        </li>
      ))}
    </ul>
  );
};
