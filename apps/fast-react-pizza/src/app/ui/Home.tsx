import { FC } from 'react';

import { useAppSelector } from '../../storeHooks';
import { CreateUser } from '../features/user/CreateUser';
import { selectUsername } from '../features/user/userSlice';
import { Button } from './Button';

export const Home: FC = () => {
  const username = useAppSelector(selectUsername);

  return (
    <div className="my-10 text-center sm:my-16">
      <h1 className="mb-8 text-xl font-semibold text-stone-700">
        The best pizza.
        <br />
        <span className="text-yellow-500">Straigth out of the oven, straigth to you.</span>
      </h1>
      {username ? <Button to="menu">Continue ordering, {username}</Button> : <CreateUser />}
    </div>
  );
};
