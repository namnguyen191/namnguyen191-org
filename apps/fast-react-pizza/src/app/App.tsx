import { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Cart } from './features/cart/Cart';
import { loader as menuLoader, Menu } from './features/menu/Menu';
import { action as createOrderAction, CreateOrder } from './features/order/CreateOrder';
import { loader as orderLoader, Order } from './features/order/Order';
import { AppLayout } from './ui/AppLayout';
import { ErrorComponent } from './ui/ErrorComponent';
import { Home } from './ui/Home';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorComponent />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/menu',
        element: <Menu />,
        loader: menuLoader,
        errorElement: <ErrorComponent />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/order/new',
        element: <CreateOrder />,
        action: createOrderAction,
      },
      {
        path: '/order/:orderId',
        element: <Order />,
        loader: orderLoader,
        errorElement: <ErrorComponent />,
      },
    ],
  },
]);

export const App: FC = () => {
  return <RouterProvider router={router}></RouterProvider>;
};
