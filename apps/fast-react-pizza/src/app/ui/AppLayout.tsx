import { FC } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';

import { CartOverview } from '../features/cart/CartOverview';
import { Header } from './Header';
import { LoadingIndicator } from './LoadingIndicator';

export const AppLayout: FC = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto]">
      {isLoading && <LoadingIndicator />}

      <Header />

      <div className="overflow-scroll">
        <main className="mx-auto max-w-3xl">
          <Outlet />
        </main>
      </div>

      <CartOverview />
    </div>
  );
};
