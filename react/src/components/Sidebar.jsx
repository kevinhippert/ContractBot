import React, { useState, useEffect } from "react";
import { useTopic, createTopic } from "../contexts/TopicContext";
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

export default function Sidebar({ view }) {
  // [{topicId: "abc123", topicName: "What is life?", isCurrent: true, seq: 2}, ...]
  const { topics, setTopics, setNewCurrentTopic, currentTopic } = useTopic();

  // create a new topic, add to the list of topics, set as current topic
  const handleNewTopicClick = () => {
    let newTopic = createTopic();
    setTopics((prevTopics) => [...prevTopics, newTopic]);
    setNewCurrentTopic(newTopic);
  };

  // set as current topic
  const handleSelectTopic = async (topic) => {
    setNewCurrentTopic(topic);
  };

  return (
    <Box sx={{ width: "250px" }}>
      <nav>
        {topics?.length && (
          <List>
            {topics.map((topic) => (
              <ListItem
                disablePadding
                key={topic.topicId}
                onClick={(e) => handleSelectTopic(topic)}
              >
                <ListItemButton
                  selected={currentTopic?.topicId === topic.topicId}
                  sx={{
                    // styles for un-selected ListItemButton
                    color: "secondary.contrastText",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    // styles for "selected" ListnItemButton
                    // MUI adds the .Mui-selected class when 'selected' is true
                    "&.Mui-selected": {
                      backgroundColor: "secondary.main",
                      color: "secondary.contrastText",
                      borderRight: "4px solid",
                      borderColor: "secondary.dark",
                      "&:hover": {
                        backgroundColor: "secondary.dark",
                      },
                    },
                  }}
                >
                  <ListItemText primary={topic.topicName} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </nav>
      {view === "queries" && (
        <Button onClick={handleNewTopicClick}>
          <AddIcon />
          new topic
        </Button>
      )}
    </Box>
  );
}
