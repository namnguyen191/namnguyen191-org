import { FC } from 'react';

import { Button, buttonDefaultProps } from '../../ui/Button';

export const CheckoutButton: FC = () => {
  return <Button {...buttonDefaultProps}>Check out</Button>;
};
