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
import logo from "../assets/SEIU.png";

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
          <img
            alt="SEIU Logo"
            src={logo}
            style={{ height: "3em", paddingRight: "2.5em", paddingLeft: "0em" }}
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
