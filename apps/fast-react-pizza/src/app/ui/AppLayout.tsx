import { FC } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';

import { CartOverview } from '../features/cart/CartOverview';
import { Header } from './Header';
import { LoadingIndicator } from './LoadingIndicator';

export const AppLayout: FC = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="layout">
      {isLoading && <LoadingIndicator />}

      <Header />

      <main>
        <Outlet />
      </main>

      <CartOverview />
    </div>
  );
};
