import React, { useState } from "react";
import { createTopicId } from "../../utils/utils";
import { useTopic } from "../../contexts/TopicContext";
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
  const [topics, setTopics] = useState([]);
  // [{topicId: "abc123", topicName: "What is life?", isCurrent: true, seq: 2}, ...]
  const { currentTopic, updateCurrentTopic } = useTopic();

  const createNewTopic = () => {
    let newTopicId = createTopicId();
    let newTopic = {
      topicId: newTopicId,
      topicName: `New Topic - ${newTopicId.slice(0, 3)}`,
      isCurrent: true,
      seq: 1,
    };

    setTopics((prevTopics) =>
      prevTopics
        .map((topic) => ({ ...topic, isCurrent: false }))
        .concat(newTopic)
    );
    updateCurrentTopic(newTopic);
  };

  const handleNewTopicClick = () => {
    createNewTopic();
  };

  const handleSelectTopic = (topic) => {
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: t.topicId === topic.topicId,
      }))
    );
    updateCurrentTopic(topic);
  };

  const sidebarHtml = (
    <Box>
      <nav>
        <List>
          {topics.map((topic) => (
            <ListItem
              disablePadding
              key={topic.topicId}
              onClick={(e) => handleSelectTopic(topic)}
            >
              <ListItemButton>
                <ListItemText
                  primary={topic.topicName}
                  sx={{
                    color: currentTopic ? "purple" : "inherit",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </nav>
      <Button onClick={handleNewTopicClick}>
        <AddIcon />
        new topic
      </Button>
    </Box>
  );
  return sidebarHtml;
}
