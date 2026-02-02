import './App.css';
//Material-UI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import NavBarOnTop from './components/base/NavBarOnTop/NavBarOnTop';
import NotificationSnackbar from './components/base/NotificationSnackbar/NotificationSnackbar';
import LoadingBackdrop from './components/base/LoadingBackdrop/LoadingBackdrop';
import React from 'react';
import PageRouter from './pages/PageRouter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#202123',
      light: '#343541',
      dark: '#000000',
    },
    secondary: {
      main: '#10a37f',
    },
    background: {
      default: '#ffffff',
      paper: '#f7f7f8',
    },
    text: {
      primary: '#343541',
      secondary: '#6e6e80',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    subtitle2: {
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBarOnTop />
        <LoadingBackdrop />
        <NotificationSnackbar />

        <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <PageRouter />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;