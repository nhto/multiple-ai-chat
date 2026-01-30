//Material-UI
import { createTheme } from '@mui/material/styles'

const customTheme = createTheme({
  typography: {
    fontFamily: ["Roboto", "Helvetica", "Arial", "sans-serif"].join(','),
    button: {
      fontSize: "1.125rem",
      textTransform: "none"
    },
    pageTitle: {
      fontWeight: "bold",
      fontSize: "1.5rem",
      lineHeight: "3em",
      lettterSpacing: "0em",
      textDecoration: "none",
      display: "block"
    }
  },
  palette: {
    primary: {
      50: "#f4e5e7",
      100: "#e3bdc3",
      200: "#d0919b",
      300: "#bd6573",
      400: "#ae4455",
      500: "#a02337",
      600: "#981f31",
      700: "#8e1a2a",
      800: "#841523",
      900: "#730c16",
      A100: "#ffa5ab",
      A200: "#ff727c",
      A400: "#ff3f4d",
      A700: "#ff2535",
      contrast: {
        50: "#000000",
        100: "#000000",
        200: "#000000",
        300: "#000000",
        400: "#ffffff",
        500: "#ffffff",
        600: "#ffffff",
        700: "#ffffff",
        800: "#ffffff",
        900: "#ffffff",
        A100: "#000000",
        A200: "#000000",
        A400: "#ffffff",
        A700: "#ffffff",
      }
    }
  }
})

export default customTheme;