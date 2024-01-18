import { FC } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Account } from './pages/Account';
import { Bookings } from './pages/Bookings';
import { Cabins } from './pages/Cabins';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { PageNotFound } from './pages/PageNotFound';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { AppLayout } from './ui/AppLayout';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/bookings',
        element: <Bookings />,
      },
      {
        path: '/cabins',
        element: <Cabins />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/account',
        element: <Account />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
]);

export const App: FC = () => {
  return <RouterProvider router={router}></RouterProvider>;
};
