import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../../store';
import { CartItem } from '../../services/apiRestaurant';

export interface CartState {
  cart: CartItem[];
}

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.cart.push(action.payload);
    },
    deleteItem: (state, action: PayloadAction<number>) => {
      const deletedItemPizzaId = action.payload;
      state.cart = state.cart.filter((item) => item.pizzaId !== deletedItemPizzaId);
    },
    increaseItemQuantity: (state, action: PayloadAction<number>) => {
      const itemPizzaId = action.payload;
      const foundItem = state.cart.find((item) => item.pizzaId === itemPizzaId);
      if (!foundItem) {
        console.warn('Could not find this item to increase its quantity: ', itemPizzaId);
        return;
      }

      foundItem.quantity++;
      foundItem.totalPrice += foundItem.unitPrice;
    },
    decreateItemQuantity: (state, action: PayloadAction<number>) => {
      const itemPizzaId = action.payload;
      const foundItem = state.cart.find((item) => item.pizzaId === itemPizzaId);
      if (!foundItem) {
        console.warn('Could not find this item to decrease its quantity: ', itemPizzaId);
        return;
      }

      foundItem.quantity--;
      foundItem.totalPrice -= foundItem.unitPrice;

      // If quantity is at 0, remove from cart.
      if (foundItem.quantity === 0) {
        cartSlice.caseReducers.deleteItem(state, action);
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const cartReducer = cartSlice.reducer;

export const { addItem, deleteItem, increaseItemQuantity, decreateItemQuantity, clearCart } =
  cartSlice.actions;

export const selectCart = (state: RootState): CartItem[] => state.cart.cart;
export const selectCartTotalQuanity = (state: RootState): number =>
  state.cart.cart.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotalPrice = (state: RootState): number =>
  state.cart.cart.reduce((sum, item) => sum + item.totalPrice, 0);
export const selectPizzaQuantity =
  (pizzaId: number) =>
  (state: RootState): number =>
    state.cart.cart.find((item) => item.pizzaId === pizzaId)?.quantity ?? 0;
