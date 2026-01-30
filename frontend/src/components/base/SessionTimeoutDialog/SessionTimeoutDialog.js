//Material-UI
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Button from '@mui/material/Button';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pingAsync, refreshAsync } from './SessionTimeoutDialogSlice';

import { TIMEOUT_MILLIS, TIMEOUT_WARN_MILLIS } from '../../../config/config';

function evalRemainingMillis(lastActivityAt) {
  const currentTimestamp = Date.now();
  const lastActivityTimestamp = (new Date(lastActivityAt)).getTime();
  const expectedTimeoutTimestamp = lastActivityTimestamp + TIMEOUT_MILLIS;

  return expectedTimeoutTimestamp - currentTimestamp;
}

function SessionTimeoutDialog() {
  const dispatch = useDispatch();

  const sliceState = useSelector((state)=>state.sessionTimeoutDialog);

  const [refreshTimestamp, setRefreshTimestamp] = useState(0);

  // Check session timeout during app start 
  useEffect(() => {
    dispatch(pingAsync());
  }, []);

  // Setup timer to evaluate session freshness every second
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setRefreshTimestamp(Date.now());
    }, 1000);
    return () => { clearInterval(countdownInterval) };
  }, []);

  const remainingMillis = !!sliceState.lastActivityAt ? evalRemainingMillis(sliceState.lastActivityAt) : 0;

  // Show dialog box when approaching session timeout
  const isOpen = !!sliceState.lastActivityAt && remainingMillis < TIMEOUT_WARN_MILLIS;

  // Check session when session timeout is expected.
  // The ping should cause logout if session has been invalidated.
  // Otherwise, the last activity date time will be updated.
  useEffect(() => {
    if (!!isOpen && remainingMillis < 0) {
      dispatch(pingAsync());
    }
  });

  const displayRemainingSecond = Math.floor(Math.max((remainingMillis / 1000) - 1, 0));

  return (
    <Dialog
      open={isOpen}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Session Timeout"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          You will be logged out in {displayRemainingSecond} seconds because of inactivity.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => { dispatch(refreshAsync()) }}>Click to resume session</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionTimeoutDialog;
