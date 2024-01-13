import { FC } from 'react';

import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { Button } from '../../ui/Button';
import { decreateItemQuantity, increaseItemQuantity, selectPizzaQuantity } from './cartSlice';

export type UpdateItemButtonProps = {
  pizzaId: number;
};

export const UpdateItemButton: FC<UpdateItemButtonProps> = ({ pizzaId }) => {
  const dispatch = useAppDispatch();
  const itemQuantity = useAppSelector(selectPizzaQuantity(pizzaId));

  return (
    <div className="flex items-center gap-1 md:gap-3">
      <Button onClick={() => dispatch(decreateItemQuantity(pizzaId))} btnType="round">
        -
      </Button>
      <span className="text-sm font-medium">{itemQuantity}</span>
      <Button onClick={() => dispatch(increaseItemQuantity(pizzaId))} btnType="round">
        +
      </Button>
    </div>
  );
};
