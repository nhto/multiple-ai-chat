import './App.css';

//Material-UI
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import PolyURedTheme from './theme/PolyURedTheme/PolyURedTheme';

import NavBarOnTop from './components/base/NavBarOnTop/NavBarOnTop';
import NotificationSnackbar from './components/base/NotificationSnackbar/NotificationSnackbar';
import LoadingBackdrop from './components/base/LoadingBackdrop/LoadingBackdrop';

import SessionTimeoutDialog from './components/base/SessionTimeoutDialog/SessionTimeoutDialog';
import LoginDeniedDialog from './components/base/LoginDeniedDialog/LoginDeniedDialog';
import LoginDialog from './components/base/LoginDialog/LoginDialog';

import React, { useEffect } from 'react';

import { isUser } from './app/util';

import { initApp } from './AppSlice';

import { useDispatch, useSelector } from 'react-redux';

// Page Router
import PageRouter from './pages/PageRouter';


function App() {
  const dispatch = useDispatch();
  const appState = useSelector((state)=>state.app);

  // Check session regularly
  useEffect(() => {
    dispatch(initApp());
  }, []);

  if (appState.isAppLaunching) {
    return (<></>);
  }
  else {
    return (
      <ThemeProvider theme={PolyURedTheme} >
        <CssBaseline />
        <NavBarOnTop />
        <LoadingBackdrop />
        <NotificationSnackbar />
  
        {
          appState.isLoggedIn === false &&
          <LoginDialog />
        }
        {
          appState.isLoggedIn === true && !isUser(appState.me) &&
          <>
            <LoginDeniedDialog />
          </>
        }
        {
          appState.isLoggedIn === true && isUser(appState.me) &&
          <>
            <SessionTimeoutDialog />
            <Box maxWidth="md" sx={{ margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
              <Box sx={{ width: '100%' }}>
                <PageRouter/>
              </Box>
            </Box>
          </>
        }
      </ThemeProvider>
    );
  }

}

export default App;
