import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Account } from './pages/Account';
import { Booking } from './pages/Booking';
import { Bookings } from './pages/Bookings';
import { Cabins } from './pages/Cabins';
import { CheckIn } from './pages/CheckIn';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { PageNotFound } from './pages/PageNotFound';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { AppLayout } from './ui/AppLayout';
import { ProtectedRoute } from './ui/ProtectedRoute';

const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate replace to="dashboard" />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: '/bookings',
        element: <Bookings />,
      },
      {
        path: '/bookings/:id',
        element: <Booking />,
      },
      {
        path: '/checkin/:id',
        element: <CheckIn />,
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
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <PageNotFound />,
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <RouterProvider router={router}></RouterProvider>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: '16px',
            maxWidth: '500px',
            padding: '16px 24px',
            backgroundColor: 'var(--color-grey-0)',
            color: 'var(--color-grey-700)',
          },
        }}
      />
    </QueryClientProvider>
  );
};
