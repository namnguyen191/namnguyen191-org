import { FC } from 'react';

import { MenuItem as MenuItemType } from '../../services/apiRestaurant';
import { formatCurrency } from '../../utils/helper';

export type MenuItemProps = {
  item: MenuItemType;
};

export const MenuItem: FC<MenuItemProps> = ({ item }) => {
  const { name, unitPrice, ingredients, soldOut, imageUrl } = item;
  return (
    <li>
      <img src={imageUrl} alt={name} />
      <div>
        <p>{name}</p>
        <p>{ingredients.join(', ')}</p>
        <div>{!soldOut ? <p>{formatCurrency(unitPrice)}</p> : <p>Sold out</p>}</div>
      </div>
    </li>
  );
};
