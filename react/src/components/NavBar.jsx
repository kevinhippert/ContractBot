import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material/";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/SEIU.png";

export default function NavBar() {
  const { authorizedUser, setAuthorizedUser } = useAuth();
  const navigate = useNavigate();

  const handleLogOutClick = () => {
    setAuthorizedUser(
      // Reset authorizedUser state and navigate to login page
      { userName: null, isAuthenticated: false }
    );
    navigate("/login");
  };

  return (
    <AppBar sx={{ position: "fixed" }}>
      <Toolbar>
        <img
          alt="SEIU Logo"
          src={logo}
          style={{ height: "3em", marginRight: "2.5em" }}
        />
        <Typography
          component="div"
          sx={{
            font: "helvetica; arial; sans-serif",
            "font-style": "italic",
            "font-weight": "bold",
            "letter-spacing": "0.02em",
            "font-size": "1.6em",
            flexGrow: 1,
          }}
        >
          ContractBot
        </Typography>
        {authorizedUser.isAuthenticated && (
          <Button color="inherit" onClick={handleLogOutClick}>
            Log out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
