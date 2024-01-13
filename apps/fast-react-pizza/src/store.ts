import { configureStore } from '@reduxjs/toolkit';

import { cartReducer } from './app/features/cart/cartSlice';
import { userReducer } from './app/features/user/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
