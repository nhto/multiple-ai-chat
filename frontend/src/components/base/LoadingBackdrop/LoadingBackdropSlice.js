import { createSlice, isRejected, isPending, isFulfilled } from '@reduxjs/toolkit';

import * as AppSlice from '../../../AppSlice';

const monitorLoadingThunks = [
  AppSlice.initApp,
];

export const LoadingBackdropSlice = createSlice(
  {
    name: 'loadingBackdrop',
    initialState: {
      isLoading: false
    },
    reducers: {
      beginLoading: (state, action) => {
        state.isLoading = true;
      },
      finishLoading: (state, action) => {
        state.isLoading = false;
      },
    },
    extraReducers: (builder) => {
      builder
        .addMatcher(isPending(...monitorLoadingThunks), (state, action) => {
          state.isLoading = true;
        })
        .addMatcher(isFulfilled(...monitorLoadingThunks), (state, action) => {
          state.isLoading = false;
        })
        .addMatcher(isRejected(...monitorLoadingThunks), (state, action) => {
          state.isLoading = false;
        })
    }
  }
);

export default LoadingBackdropSlice;
