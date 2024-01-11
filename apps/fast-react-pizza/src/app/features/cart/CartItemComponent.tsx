import { FC } from 'react';

import { CartItem } from '../../services/apiRestaurant';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../utils/helper';

export type CartItemProps = {
  item: CartItem;
};

export const CartItemComponent: FC<CartItemProps> = ({ item }) => {
  const { pizzaId, name, quantity, totalPrice } = item;

  return (
    <li className="py-3 sm:flex sm:items-center sm:justify-between">
      <p className="mb-1 sm:mb-0">
        {quantity}&times; {name}
      </p>
      <div className="flex items-center justify-between sm:gap-6">
        <p className="text-sm font-bold">{formatCurrency(totalPrice)}</p>
        <Button btnType="small">Delete</Button>
      </div>
    </li>
  );
};