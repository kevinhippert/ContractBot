import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material/";
import MenuIcon from "@mui/icons-material/Menu";

export default function NavBar() {
  const { authorizedUser, setAuthorizedUser } = useAuth();
  const navigate = useNavigate();

  const handleLogOutClick = () => {
    setAuthorizedUser(false);
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BossBot
          </Typography>
          {authorizedUser && (
            <Button color="inherit" onClick={handleLogOutClick}>
              Log out
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
