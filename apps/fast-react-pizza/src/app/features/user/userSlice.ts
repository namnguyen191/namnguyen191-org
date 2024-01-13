// const getPosition = (): Promise<any> => {
//   return new Promise(function (resolve, reject) {
//     navigator.geolocation.getCurrentPosition(resolve, reject);
//   });
// };

// export type Address = {
//   position: string;
//   address: string;
// };
// export const fetchAddress = async (): Promise<Address> => {
//   // 1) We get the user's geolocation position
//   const positionObj = await getPosition();
//   const position = {
//     latitude: positionObj.coords.latitude,
//     longitude: positionObj.coords.longitude,
//   };

//   // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
//   const addressObj = await getAddress(position);
//   const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

//   // 3) Then we return an object with the data that we are interested in
//   return { position, address };
// };
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../../store';

export interface UserState {
  username: string;
}

const initialState: UserState = {
  username: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
  },
});

export const userReducer = userSlice.reducer;

export const { updateName } = userSlice.actions;

export const selectUsername = (state: RootState): string => state.user.username;
