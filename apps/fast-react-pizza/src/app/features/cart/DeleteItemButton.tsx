import { FC } from 'react';

import { useAppDispatch } from '../../../storeHooks';
import { Button } from '../../ui/Button';
import { deleteItem } from './cartSlice';

export type DeleteItemButtonProps = {
  pizzaId: number;
};

export const DeleteItemButton: FC<DeleteItemButtonProps> = ({ pizzaId }) => {
  const dispatch = useAppDispatch();

  return <Button onClick={() => dispatch(deleteItem(pizzaId))}>Delete</Button>;
};
