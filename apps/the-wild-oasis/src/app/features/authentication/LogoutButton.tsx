import { ReactElement } from 'react';
import { HiArrowRightOnRectangle } from 'react-icons/hi2';

import { ButtonIcon } from '../../ui/ButtonIcon';
import { SpinnerMini } from '../../ui/SpinnerMini';
import { useLogout } from './authQueryHooks';

export const LogoutButton = (): ReactElement => {
  const { logout, isLogingOut } = useLogout();

  return (
    <ButtonIcon onClick={() => logout()} disabled={isLogingOut}>
      {isLogingOut ? <SpinnerMini /> : <HiArrowRightOnRectangle />}
    </ButtonIcon>
  );
};
