import { configureStore } from '@reduxjs/toolkit';

// App
import AppSlice from '../AppSlice';
import SessionTimeoutDialogSlice from '../components/base/SessionTimeoutDialog/SessionTimeoutDialogSlice';
import NotificationSnackbarSlice from '../components/base/NotificationSnackbar/NotificationSnackbarSlice';
import LoadingBackdropSlice from '../components/base/LoadingBackdrop/LoadingBackdropSlice';

// User Pages


export const store = configureStore({
  reducer: {
    app: AppSlice.reducer,
    sessionTimeoutDialog: SessionTimeoutDialogSlice.reducer,
    snackbarNotification: NotificationSnackbarSlice.reducer,
    loadingBackdrop: LoadingBackdropSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
  devTools: false
});
