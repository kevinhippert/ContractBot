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
  // TODO: How to get these into the template?
  const topicOne = {"primary": createTopicId()};
  const topicTwo = {"primary": createTopicId()};

  const sidebarHtml = (
    <Box>
      <nav>
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText {...topicOne} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="#simple-list">
              <ListItemText {...topicTwo} />
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
