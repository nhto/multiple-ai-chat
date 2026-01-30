import { Button } from "@mui/material";
import { Link } from 'react-router-dom';

function BackToMenuButton(props) {
  return (
    <Link to='/' style={{ textDecoration: "none" }}>
      <Button variant='contained'>
        Back
      </Button>
    </Link>
  )
}

export default BackToMenuButton;