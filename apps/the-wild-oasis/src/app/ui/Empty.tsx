import { FC } from 'react';

export type EmptyProps = {
  resource: string;
};
export const Empty: FC<EmptyProps> = ({ resource }) => {
  return <p>No {resource} could be found.</p>;
};
