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

theme.typography.h1 = {
  fontSize: "1.2rem",
};

theme.typography.h2 = {
  fontSize: "1.1rem",
};

theme.typography.h3 = {
  fontSize: "1.0rem",
};

theme.typography.h4 = {
  fontSize: "0.9rem",
};

theme.typography.h5 = {
  fontSize: "0.8rem",
};

theme.typography.h6 = {
  fontSize: "0.7rem",
};

export default theme;
