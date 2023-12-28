import { FC, PropsWithChildren } from 'react';

export const Navbar: FC<PropsWithChildren> = ({ children }) => {
  return <nav className="nav-bar">{children}</nav>;
};
