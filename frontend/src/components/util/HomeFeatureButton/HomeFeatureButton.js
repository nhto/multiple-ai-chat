import Button from "@mui/material/Button";
import PlainLink from "../PlainLink/PlainLink";

function HomeFeatureButton(props) {
  return (
    <PlainLink to={props.to}>
      <Button
        style={{ height: "150px", width: "150px", marginBottom: "2rem", marginRight: "2rem" }}
        variant="contained"
      >
        {props.text}
      </Button>
    </PlainLink>
  )
}

export default HomeFeatureButton;