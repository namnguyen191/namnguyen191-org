import { FC } from 'react';

import { CartItem } from '../../services/apiRestaurant';
import { formatCurrency } from '../../utils/helper';

export type OrderItemProps = {
  item: CartItem;
  isLoadingIngredients?: boolean;
  ingredients?: string[];
};

export const OrderItem: FC<OrderItemProps> = ({ item, isLoadingIngredients, ingredients }) => {
  const { quantity, name, totalPrice } = item;

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <p>
          <span className="font-bold">{quantity}&times;</span> {name}
        </p>
        <p className="font-bold">{formatCurrency(totalPrice)}</p>
      </div>
    </li>
  );
};
