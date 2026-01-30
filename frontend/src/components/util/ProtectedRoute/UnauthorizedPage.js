import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

const errorHeading = {
  fontSize: "6rem",
  fontWeight: "100"
};

const errorMessage = {
  fontSize: "1.5rem",
};

function UnauthorizedPage(props) {
  const navigate = useNavigate();

  return (
    <Box maxWidth="md" sx={{ margin: "0 auto" }}>
      <Box sx={{ width: '100%' }}>
        <span style={errorHeading}>Unauthorized</span>
        <p style={errorMessage}>You are not authorized to access this page.</p>
        <Button variant='contained' onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  )
}

export default UnauthorizedPage;