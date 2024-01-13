import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../../../store';
import { Coords, getAddress } from '../../services/apiGeocoding';

const getPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve: PositionCallback, reject: PositionErrorCallback) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

export type Address = {
  position: Coords;
  address: string;
};

export type AddressData = {
  status: 'loading' | 'loaded' | 'error' | null;
  position: Coords | null;
  address: string | null;
  error: string | null;
};

export interface UserState {
  username: string;
  addressData: AddressData;
}

const initialState: UserState = {
  username: '',
  addressData: {
    status: null,
    position: null,
    address: null,
    error: null,
  },
};

export const fetchAddress = createAsyncThunk('user/fetchAddress', async () => {
  // 1) We get the user's geolocation position
  const positionObj = await getPosition();
  const position = {
    latitude: positionObj.coords.latitude,
    longitude: positionObj.coords.longitude,
  };

  // 2) Then we use a reverse geocoding API to get a description of the user's address, so we can display it the order form, so that the user can correct it if wrong
  const addressObj = await getAddress(position);
  const address = `${addressObj?.locality}, ${addressObj?.city} ${addressObj?.postcode}, ${addressObj?.countryName}`;

  // 3) Then we return an object with the data that we are interested in
  return { position, address };
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateName: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAddress.pending, (state) => {
        state.addressData.status = 'loading';
      })
      .addCase(fetchAddress.fulfilled, (state, { payload }) => {
        const { position, address } = payload;
        state.addressData.status = 'loaded';
        state.addressData.position = position;
        state.addressData.address = address;
      })
      .addCase(fetchAddress.rejected, (state, { error }) => {
        const { message } = error;
        state.addressData.status = 'error';
        state.addressData.error = message ?? 'Unknown error';
      }),
});

export const userReducer = userSlice.reducer;

export const { updateName } = userSlice.actions;

export const selectUsername = (state: RootState): string => state.user.username;
export const selectUserAddressData = (state: RootState): AddressData => state.user.addressData;
