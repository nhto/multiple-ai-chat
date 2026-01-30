import React from 'react';
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function DeptAbbrMenu({ deptAbbrList, value, onChange, ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="deptAbbrButton"
        aria-controls={open ? 'deptAbbrButton' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {!!value ? String(value) : 'All'}
      </Button>
      <Menu
        id="deptAbbrMenu"
        aria-labelledby="deptAbbrMenu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem key={'All'} onClick={() => { handleClose(); onChange(null); }}>All</MenuItem>
        {
          Array.isArray(deptAbbrList) && deptAbbrList.map((deptAbbr) => {
            return <MenuItem key={deptAbbr} onClick={() => { handleClose(); onChange(deptAbbr); }}>{deptAbbr}</MenuItem>
          })
        }
      </Menu>
    </>
  )
}

export default DeptAbbrMenu;