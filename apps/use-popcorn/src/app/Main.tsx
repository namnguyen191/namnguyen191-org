import { FC, PropsWithChildren } from 'react';

export const Main: FC<PropsWithChildren> = ({ children }) => {
  return <main className="main">{children}</main>;
};
