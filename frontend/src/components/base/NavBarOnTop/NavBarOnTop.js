import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ChatIcon from '@mui/icons-material/Chat';
import { NavLink } from 'react-router-dom';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

function NavBarOnTop() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize: 28 }} />
            <Typography 
              variant="h6" 
              noWrap 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.02em',
                background: 'linear-gradient(45deg, #202123 30%, #10a37f 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MAC
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={i18n.language || 'en'}
                onChange={handleLanguageChange}
                displayEmpty
                startAdornment={<LanguageIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />}
                sx={{ 
                  borderRadius: '8px',
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    py: 1
                  }
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="zhHK">繁體中文</MenuItem>
                <MenuItem value="zhCN">简体中文</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default NavBarOnTop;