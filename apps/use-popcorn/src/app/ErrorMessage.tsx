import { FC } from 'react';

export type ErrorMessageProps = {
  message: string;
};

export const ErrorMessage: FC<ErrorMessageProps> = ({ message }) => {
  return (
    <p className="error">
      <span role="img" aria-label="error icon">
        ⛔️
      </span>{' '}
      {message}
    </p>
  );
};
