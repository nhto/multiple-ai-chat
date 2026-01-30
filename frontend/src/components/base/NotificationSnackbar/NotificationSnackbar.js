import {
  Snackbar,
  Alert
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { SNACKBAR_DURATION } from '../../../config/config';

function NotificationSnackbar() {

  const [isOpen, setIsOpen] = useState(false);
  const [alertProps, setAlertProps] = useState({ alertId: null, severity: null, message: null });

  const sliceState = useSelector((state) => state.snackbarNotification);

  if (!!sliceState.alertId && sliceState.alertId !== alertProps.alertId) {
    if (!!sliceState.severity && !!sliceState.message) {
      setAlertProps({
        alertId: sliceState.alertId,
        severity: sliceState.severity,
        message: sliceState.message,
      });
      setIsOpen(true);
    }
  }

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={SNACKBAR_DURATION}
      onClose={() => { setIsOpen(false); }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={() => { setIsOpen(false); }}
        severity={alertProps.severity}
        sx={{ width: '100%', fontSize: '22px' }} 
      >
        {alertProps.message}
      </Alert>
    </Snackbar>
  )
}

export default NotificationSnackbar;