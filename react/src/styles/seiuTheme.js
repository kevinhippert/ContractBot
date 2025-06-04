import { createTheme } from "@mui/material/styles";

const colors = {
  seiuPurple: "#664697",
  slateBlue: "#72A3D2",
  white: "#ffffff",
  yellow: "#dfc118",
  lightPurple: "#c6a0f01a",
  lightBlack: "#000000cc",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.seiuPurple,
    },
    secondary: {
      main: colors.lightPurple,
      contrastText: colors.lightBlack,
    },
    contrast: {
      main: colors.yellow,
      contrastText: colors.white,
    },
  },
});

export default theme;
