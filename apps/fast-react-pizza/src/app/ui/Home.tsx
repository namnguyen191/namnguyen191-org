import { FC } from 'react';

import { CreateUser } from '../features/user/CreateUser';

export const Home: FC = () => {
  return (
    <div className="my-10 text-center sm:my-16">
      <h1 className="mb-8 text-xl font-semibold text-stone-700">
        The best pizza.
        <br />
        <span className="text-yellow-500">Straigth out of the oven, straigth to you.</span>
      </h1>
      <CreateUser />
    </div>
  );
};
