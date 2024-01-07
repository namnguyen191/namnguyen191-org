import { FC } from 'react';
import { Link } from 'react-router-dom';

export const Home: FC = () => {
  return (
    <div>
      <Link to="/menu">To Menu</Link>
    </div>
  );
};
