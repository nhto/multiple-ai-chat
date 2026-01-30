import './App.css';
//Material-UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import NavBarOnTop from './components/base/NavBarOnTop/NavBarOnTop';
import NotificationSnackbar from './components/base/NotificationSnackbar/NotificationSnackbar';
import LoadingBackdrop from './components/base/LoadingBackdrop/LoadingBackdrop';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageRouter from './pages/PageRouter';

const theme = createTheme();

function App() {
  const dispatch = useDispatch();
  const appState = useSelector((state) => state.app);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBarOnTop />
      <LoadingBackdrop />
      <NotificationSnackbar />

      <Box maxWidth="md" sx={{ margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        <Box sx={{ width: '100%' }}>
          <PageRouter />
        </Box>
      </Box>
    </ThemeProvider>
  );

}

export default App;
