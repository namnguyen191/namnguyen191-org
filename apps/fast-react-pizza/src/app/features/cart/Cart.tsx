import { FC } from 'react';

import { useAppDispatch, useAppSelector } from '../../../storeHooks';
import { Button } from '../../ui/Button';
import { LinkButton } from '../../ui/LinkButton';
import { selectUsername } from '../user/userSlice';
import { CartItemComponent } from './CartItemComponent';
import { clearCart, selectCart } from './cartSlice';
import { EmptyCart } from './EmptyCart';

export const Cart: FC = () => {
  const username = useAppSelector(selectUsername);
  const cart = useAppSelector(selectCart);
  const dispatch = useAppDispatch();

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="px-4 py-3">
      <LinkButton to="/menu">&larr; Back to menu</LinkButton>

      <h2 className="mt-7 text-xl font-semibold">Your cart, {username}</h2>

      <ul className="mt-3 divide-y divide-stone-200 border-b">
        {cart.map((item, index) => (
          <CartItemComponent key={index} item={item} />
        ))}
      </ul>

      <div className="mt-6 space-x-2">
        <Button to="/order/new">Order pizzas</Button>
        <Button onClick={() => dispatch(clearCart())} btnType="secondary">
          Clear cart
        </Button>
      </div>
    </div>
  );
};
