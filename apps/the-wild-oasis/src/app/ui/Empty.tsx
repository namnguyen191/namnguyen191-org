import { FC } from 'react';

export type EmptyProps = {
  resourceName: string;
};
export const Empty: FC<EmptyProps> = ({ resourceName }) => {
  return <p>No {resourceName} could be found.</p>;
};
