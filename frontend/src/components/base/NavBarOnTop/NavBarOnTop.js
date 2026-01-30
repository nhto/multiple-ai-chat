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

import { deleteAllCookies, isUserHoU } from '../../../app/util'

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'fixed',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const DrawerItem = (props) => {
  return (
    <NavLink to={props.to} style={{ textDecoration: 'none', display: 'block', color: 'black' }}>
      <MenuItem>
        <ListItemIcon>
          <props.icon />
        </ListItemIcon>

        <ListItemText
          primary={props.text}
          primaryTypographyProps={{ style: { whiteSpace: "normal" } }}
        />
      </MenuItem>
    </NavLink>
  );
};

function NavBarOnTop() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const appState = useSelector((state) => state.app);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  var drawerItems = [];

  if (isUserHoU(appState.me)) {
    drawerItems.push({
      "to": "/hou/role",
      "icon": ManageAccountsIcon,
      "text": "Manage HoU Delegates"
    });
    drawerItems.push({
      "to": "/hou/attendee",
      "icon": ManageAccountsIcon,
      "text": "Manage Attendee Records"
    });
  }
  else {
    drawerItems.push({
      "to": "/manageDepartmentQuota",
      "icon": ManageAccountsIcon,
      "text": "Manage Department Quota"
    });
    drawerItems.push({
      "to": "/manageRoster",
      "icon": AssignmentIndIcon,
      "text": "Manage Roster"
    });
    drawerItems.push({
      "to": "/uploadAttendanceRecords",
      "icon": UploadIcon,
      "text": "Upload Attendance Records"
    });
    drawerItems.push({
      "to": "/manageAttendanceRecords",
      "icon": AssignmentIndIcon,
      "text": "List Roles"
    });
    drawerItems.push({
      "to": "/listRoles",
      "icon": UploadIcon,
      "text": "Upload Attendee"
    });
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography noWrap sx={{ fontSize: "1.6rem", flexGrow: 1 }}>
            PolyU Online Training / Survey For New Students
          </Typography>
          {
            (!!appState.isLoggedIn)
            &&
            <IconButton
              color="inherit"
              aria-label="logout"
              edge="end"
              onClick={() => { deleteAllCookies(); window.location.href = "/logout" }}
              style={{ margin: "0" }}
            >
              <ExitToAppIcon />
            </IconButton>
          }
          {/* {
            (!!appState.isLoggedIn)
            &&
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerOpen}
              style={{ margin: "0" }}
            >
              <MenuIcon />
            </IconButton>
          } */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="right"
        open={open}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: {
              xs: 1,
              sm: 240
            }
          }
        }}
      >
        <Box
          role="presentation"
          onClick={handleDrawerClose}
          onKeyDown={handleDrawerClose}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <MenuList>
            {
              drawerItems.map((item, index) => (
                <DrawerItem key={index} to={item.to} icon={item.icon} text={item.text} />
              ))
            }
          </MenuList>

        </Box>

      </Drawer>
    </>
  );
}

export default NavBarOnTop;
