import { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Cart } from './features/cart/Cart';
import { Menu } from './features/menu/Menu';
import { CreateOrder } from './features/order/CreateOrder';
import { Order } from './features/order/Order';
import { AppLayout } from './ui/AppLayout';
import { Home } from './ui/Home';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/menu',
        element: <Menu />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/order/new',
        element: <CreateOrder />,
      },
      {
        path: '/order/:orderId',
        element: <Order />,
      },
    ],
  },
]);

export const App: FC = () => {
  return <RouterProvider router={router}></RouterProvider>;
};
