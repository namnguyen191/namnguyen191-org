import { FC } from 'react';

import { MenuItem as MenuItemType } from '../../services/apiRestaurant';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../utils/helper';

export type MenuItemProps = {
  item: MenuItemType;
};

export const MenuItem: FC<MenuItemProps> = ({ item }) => {
  const { name, unitPrice, ingredients, soldOut, imageUrl } = item;
  return (
    <li className="flex gap-4 py-2">
      <img className={`h-24 ${soldOut ? 'opacity-70 grayscale' : ''}`} src={imageUrl} alt={name} />
      <div className="flex grow flex-col pt-0.5">
        <p className="font-medium">{name}</p>
        <p className="text-sm capitalize italic text-stone-500">{ingredients.join(', ')}</p>
        <div className="mt-auto flex items-center justify-between">
          {!soldOut ? (
            <p className="text-sm">{formatCurrency(unitPrice)}</p>
          ) : (
            <p className="text-sm font-medium uppercase text-stone-500">Sold out</p>
          )}

          <Button btnType="small">Add to cart</Button>
        </div>
      </div>
    </li>
  );
};
