import { useSelector } from "react-redux";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

/*
 * Raise backdrop to the frontmost of the screen
 * The zIndex is arbitrary large and is larger than default MUI models
 */
function LoadingBackdrop(props) {
  const sliceState = useSelector((state) => state.loadingBackdrop);

  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: 15000 }}
      open={sliceState.isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}

export default LoadingBackdrop;