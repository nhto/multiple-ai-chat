//Material-UI
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Button from '@mui/material/Button';

import React from 'react';

const navigateToLogout = () => {
  window.location.href = "/logout";
}

function LoginDeniedDialog() {

  return (
    <Dialog
      open={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Login Denied"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Only authorized staff/students are allowed to access this application.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={navigateToLogout}>Logout</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LoginDeniedDialog;
