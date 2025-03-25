import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

export default function Sidebar() {
  return (
    <Box sx={{ width: "100%", maxWidth: 250, bgcolor: "background.paper" }}>
      <nav aria-label="secondary mailbox folders">
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Topic 1" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="#simple-list">
              <ListItemText primary="Topic 2" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
