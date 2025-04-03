import * as React from "react";
import { createTopicId } from "../../utils/utils";
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
  const topicOne = createTopicId();
  const topicTwo = createTopicId();

  const sidebarHtml = (
    <Box>
      <nav>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="{topicOne}" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="#simple-list">
              <ListItemText primary="{topicTwo}" />
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
  return sidebarHtml;
}
