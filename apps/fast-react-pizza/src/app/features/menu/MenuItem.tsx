import { FC } from 'react';

import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { MenuItem as MenuItemType } from '../../services/apiRestaurant';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../utils/helper';
import { addItem, selectPizzaQuantity } from '../cart/cartSlice';
import { DeleteItemButton } from '../cart/DeleteItemButton';
import { UpdateItemButton } from '../cart/UpdateItemButton';

export type MenuItemProps = {
  item: MenuItemType;
};

export const MenuItem: FC<MenuItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = item;
  const itemQuantity = useAppSelector(selectPizzaQuantity(id));
  const isInCart = itemQuantity > 0;

  const handleAddToCart = (): void => {
    dispatch(
      addItem({
        pizzaId: id,
        name,
        unitPrice,
        totalPrice: unitPrice,
        quantity: 1,
      })
    );
  };

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

          {!soldOut && isInCart && (
            <div className="flex items-center gap-3 sm:gap-8">
              <UpdateItemButton pizzaId={id} />
              <DeleteItemButton pizzaId={id} />
            </div>
          )}

          {!soldOut && !isInCart && (
            <Button onClick={handleAddToCart} btnType="small">
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </li>
  );
};
