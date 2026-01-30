import { configureStore } from '@reduxjs/toolkit';

// App
import AppSlice from '../AppSlice';
import NotificationSnackbarSlice from '../components/base/NotificationSnackbar/NotificationSnackbarSlice';
import LoadingBackdropSlice from '../components/base/LoadingBackdrop/LoadingBackdropSlice';


export const store = configureStore({
  reducer: {
    app: AppSlice.reducer,
    snackbarNotification: NotificationSnackbarSlice.reducer,
    loadingBackdrop: LoadingBackdropSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
  devTools: false
});
