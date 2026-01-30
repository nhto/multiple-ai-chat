//Material-UI
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';

import Button from '@mui/material/Button';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import { Helmet } from 'react-helmet';
import { useSearchParams } from "react-router-dom";

import { KEYCLOAK_LOGIN_TYPE } from '../../../app/AppConstants'

const navigateToPolyuSso = () => {
  const originUrl = !!(window.location.pathname + window.location.search) ? String((window.location.pathname + window.location.search)) : "/";
  window.location.href = "/polyusso-init?originUrl=" + encodeURIComponent(originUrl);
}

const navigateToKeycloak = (loginType) => {
  const originUrl = !!(window.location.pathname + window.location.search) ? String((window.location.pathname + window.location.search)) : "/";
  window.location.href = `/keycloak-init/${loginType}?originUrl=` + encodeURIComponent(originUrl);
}

function LoginDialog() {
  // Auto redirect. Comment the following to show dialog box.
  navigateToPolyuSso();

  const appState = useSelector((state) => state.app);

  return (
    <>
      <Dialog
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          Please choose to login if you are:
        </DialogTitle>
        <DialogContent>
          <Button
            variant='contained'
            onClick={navigateToPolyuSso}
            sx={{ height: "4rem", mb: "2rem" }}
            fullWidth
          >
            <Typography variant='h5'>PolyU Students</Typography>
          </Button>
        </DialogContent>
      </Dialog >
    </>
  );
}

export default LoginDialog;
