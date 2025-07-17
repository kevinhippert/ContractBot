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
  IconButton,
} from "@mui/material/";
import AddIcon from "@mui/icons-material/Add";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function Sidebar({ view }) {
  // [{topicId: "abc123", topicName: "What is life?", isCurrent: true, seq: 2}, ...]
  const { topics, setTopics, setNewCurrentTopic, currentTopic, deleteTopic, renameTopic } = useTopic();

  const [anchorEl, setAnchorEl] = useState(null); // menu anchor
  const [menuTopic, setMenuTopic] = useState(null); // specific topic that's being manipulated
  const open = Boolean(anchorEl);

  const [editingTopicId, setEditingTopicId] = useState(null); // id of topic being renamed
  const [editedTopicName, setEditedTopicName] = useState(""); // new name of topic

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

  // delete current topic
  const handleDeleteTopic = (topicId) => {
    deleteTopic(topicId)
  };

  // rename current topic
  const handleRenameTopic = (topic) => {
    setEditingTopicId(topic.topicId);
    setEditedTopicName(topic.topicName);
  };

  // submit rename
  const handleSubmitRename = async (topicId) => {
    await renameTopic(topicId, editedTopicName);
    setEditingTopicId(null)
  }

  return (
    <Box
      sx={{
        marginTop: "85px",
        width: "300px",
      }}
      className="scrollable-content"
    >
      <nav>
        {topics?.length && (
          <List sx={{ padding: "0px" }}>
            {topics.map((topic) => (
              <ListItem
                disablePadding
                key={topic.topicId}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="more options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnchorEl(e.currentTarget);
                      setMenuTopic(topic);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
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

                      "&:hover": {
                        backgroundColor: "secondary.dark",
                      },
                    },
                  }}
                >
                  <ListItemText primary={
                    editingTopicId === topic.topicId ? (
                      <input
                        id={`rename-${topic.topicId}`}
                        autoFocus
                        value={editedTopicName}
                        onChange={(e) => setEditedTopicName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSubmitRename(topic.topicId)
                          }
                        }}
                      />
                    ) : (topic.topicName)} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </nav>
      {view === "queries" && (
        <Button
          onClick={handleNewTopicClick}
          sx={{ margin: "5px 5px 15px 5px", flexShrink: 0, width: "100%" }}
          variant="outlined"
        >
          <AddIcon />
          new topic
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => {
          setAnchorEl(null);
          setMenuTopic(null);
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            handleRenameTopic(menuTopic);
            setAnchorEl(null);
            setMenuTopic(null);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteTopic(menuTopic.topicId);
            setAnchorEl(null);
            setMenuTopic(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
