import { createTheme } from "@mui/material/styles";

const colors = {
  seiuPurple: "#664697",
  slateBlue: "#72A3D2",
  white: "#ffffff",
  yellow: "#dfc118",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.seiuPurple,
    },
    secondary: {
      main: colors.slateBlue,
      contrastText: colors.white,
    },
    contrast: {
      main: colors.yellow,
      contrastText: colors.white,
    },
  },
});

export default theme;
