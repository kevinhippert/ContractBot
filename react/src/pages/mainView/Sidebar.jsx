import * as React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
} from "@mui/material/";
import AddIcon from "@mui/icons-material/Add";

export default function Sidebar() {
  return (
    <Box sx={{ maxWidth: "200px" }}>
      <nav>
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
      <Button>
        <AddIcon />
        new topic
      </Button>
    </Box>
  );
}
