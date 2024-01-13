import { FC } from 'react';
import { useRouteError } from 'react-router-dom';

import { LinkButton } from './LinkButton';

export const ErrorComponent: FC = () => {
  const routeErr = useRouteError();

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'string') {
      return err.data;
    }

    if (err instanceof Error) {
      return err.message;
    }

    return 'Unknow error';
  };

  return (
    <div>
      <h1>
        Something went wrong{' '}
        <span role="img" aria-hidden>
          😢
        </span>
      </h1>
      <p>{getErrorMessage(routeErr)}</p>
      <LinkButton to="-1">&larr; Go back</LinkButton>
    </div>
  );
};
