import { FC } from 'react';
import { Link } from 'react-router-dom';

export const Header: FC = () => {
  return (
    <header>
      <Link to="/">Fast React Pizza Co.</Link>
    </header>
  );
};
