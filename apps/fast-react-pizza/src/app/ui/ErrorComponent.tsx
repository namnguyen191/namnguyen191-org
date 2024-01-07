import { FC } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

export const ErrorComponent: FC = () => {
  const navigate = useNavigate();
  const routeErr = useRouteError();

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'data' in err && typeof err.data === 'string') {
      return err.data;
    }

    if (err instanceof Error) {
      return err.message;
    }

    console.log('Nam data is: ', err);
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
      <button onClick={() => navigate(-1)}>&larr; Go back</button>
    </div>
  );
};
