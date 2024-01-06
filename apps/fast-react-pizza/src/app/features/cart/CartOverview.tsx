import { FC } from 'react';
import { Link } from 'react-router-dom';

export const CartOverview: FC = () => {
  return (
    <div>
      <Link to="/card">Open cart &rarr;</Link>
    </div>
  );
};
