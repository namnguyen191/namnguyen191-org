import { FC } from 'react';

import { average } from './helpers';
import { UserWatchData } from './interfaces';

type WatchSummaryProps = {
  watched: UserWatchData[];
};
export const WatchSummary: FC<WatchSummaryProps> = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(
    watched.map((movie) => parseFloat(movie.Runtime.split(' ')[0] ?? '0')),
  );

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span role="img" aria-hidden>
            #️⃣
          </span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span role="img" aria-hidden>
            ⭐️
          </span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span role="img" aria-hidden>
            🌟
          </span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span role="img" aria-hidden>
            ⏳
          </span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
};
