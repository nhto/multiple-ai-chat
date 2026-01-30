import React from 'react';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import UploadIcon from '@mui/icons-material/Upload';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

function NavBarOnTop() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const appState = useSelector((state) => state.app);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography noWrap sx={{ fontSize: "1.6rem", flexGrow: 1 }}>
            MAC
          </Typography>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default NavBarOnTop;
