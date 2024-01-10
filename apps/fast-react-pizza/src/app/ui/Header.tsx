import { FC } from 'react';
import { Link } from 'react-router-dom';

import { SearchOrder } from '../features/order/SearchOrder';
import { Username } from '../features/user/Username';

export const Header: FC = () => {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-yellow-500 px-4 py-3 uppercase">
      <Link to="/" className="tracking-widest">
        Fast React Pizza Co.
      </Link>
      <SearchOrder />
      <Username />
    </header>
  );
};
