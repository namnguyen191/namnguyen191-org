import { FC, useRef, useState } from 'react';

import { CollapsibleBox } from './CollapsibleBox';
import { ErrorMessage } from './ErrorMessage';
import { UserWatchData } from './interfaces';
import { Loader } from './Loader';
import { Main } from './Main';
import { MovieDetails } from './MovieDetails';
import { MoviesList } from './MovieList';
import { Navbar } from './Navbar';
import { SearchBar } from './SearchBar';
import { useKeyWatch } from './useKeyWatch';
import { useLocalStorage } from './useLocalStorage';
import { useMovies } from './useMovies';
import { debounced } from './utils';
import { WatchedMoviesList } from './WatchedMoviesList';
import { WatchSummary } from './WatchSummary';

const Logo: FC<{ onclick: () => void }> = ({ onclick }) => {
  return (
    <div onClick={onclick} className="logo">
      <span role="img" aria-label="icon">
        🍿
      </span>
      <h1>usePopcorn</h1>
    </div>
  );
};

type NumResultProps = {
  count: number;
};
const NumResult: FC<NumResultProps> = ({ count }) => {
  return (
    <p className="num-results">
      Found <strong>{count}</strong> results
    </p>
  );
};

export const App: FC = () => {
  const [query, setQuery] = useState<string>('');
  const [watched, setWatched] = useLocalStorage<UserWatchData[]>('watched', []);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const secretModalRef = useRef<HTMLDialogElement | null>(null);
  const { movies, isLoading, error } = useMovies(query);

  const onAddToWatched = (newWatched: UserWatchData) => {
    const foundWatched = watched.find((wMovie) => wMovie.imdbID === newWatched.imdbID);
    if (!foundWatched) {
      setWatched((oldWatched) => [...oldWatched, newWatched]);
      return;
    }

    setWatched((oldWatched) =>
      oldWatched.map((old) =>
        old.imdbID === newWatched.imdbID ? { ...old, userRating: newWatched.userRating } : old,
      ),
    );
  };

  const onDeleteWatched = (deletedId: string) => {
    setWatched((oldWatched) => oldWatched.filter((old) => old.imdbID !== deletedId));
  };

  const handleCloseMovie = () => setSelectedMovieId(null);

  useKeyWatch('esc', handleCloseMovie);

  return (
    <>
      <dialog
        onClick={() => secretModalRef.current?.close()}
        style={{ inset: 0, margin: 'auto' }}
        ref={secretModalRef}
      >
        <div
          style={{
            height: '30vh',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className="container"
        >
          <h4>You've found the secret modal!</h4>
        </div>
      </dialog>
      <Navbar>
        <Logo
          onclick={() => {
            secretModalRef.current?.showModal();
          }}
        />
        <SearchBar onSearch={debounced(setQuery)} />
        <NumResult count={movies.length} />
      </Navbar>

      <Main>
        <CollapsibleBox>
          {isLoading && <Loader />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MoviesList onMovieSelected={setSelectedMovieId} movies={movies} />
          )}
        </CollapsibleBox>

        <CollapsibleBox>
          {selectedMovieId ? (
            <MovieDetails
              watched={watched}
              selectedId={selectedMovieId}
              onAddToWatched={onAddToWatched}
              onCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={onDeleteWatched} />
            </>
          )}
        </CollapsibleBox>
      </Main>
    </>
  );
};
