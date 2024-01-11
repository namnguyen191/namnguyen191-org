import { FC } from 'react';

import { useAppSelector } from '../../../storeHooks';
import { selectUsername } from './userSlice';

export const Username: FC = () => {
  const userName: string = useAppSelector(selectUsername);

  if (!userName) {
    return null;
  }

  return <div className="hidden text-sm font-semibold md:block md:text-3xl">{userName}</div>;
};
