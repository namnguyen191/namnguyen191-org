import { FC } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '../../../storeHooks';
import { formatCurrency } from '../../utils/helper';
import { selectCartTotalPrice, selectCartTotalQuanity } from './cartSlice';

export const CartOverview: FC = () => {
  const totalCartQuantity = useAppSelector(selectCartTotalQuanity);
  const totalCartPrice = useAppSelector(selectCartTotalPrice);

  if (!totalCartQuantity) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-stone-800 px-4 py-4 text-sm uppercase text-stone-200 sm:px-6 md:text-base">
      <p className="space-x-4 font-semibold text-stone-300 sm:space-x-6">
        <span>{totalCartQuantity} pizzas</span>
        <span>{formatCurrency(totalCartPrice)}</span>
      </p>
      <Link to="/cart">Open cart &rarr;</Link>
    </div>
  );
};
