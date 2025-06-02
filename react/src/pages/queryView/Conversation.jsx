import React, { useEffect, useState, useRef } from "react";
import { useTopic } from "../../contexts/TopicContext";
import LinearProgress from "@mui/material/LinearProgress";
import Answer from "./Answer";
import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { FeedbackModal } from "./FeedbackModal";
import { formatQuery } from "../../utils/utils";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({});
  const { currentTopic } = useTopic();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleClose = () => {
    setFeedbackModalOpen(false);
  };

  const handleFeedbackModalOpen = (answer, fragment, query) => {
    setFeedbackModalData({
      Topic: answer.topic,
      OnBehalfOf: user.userName,
      Query: query[0],
      Fragment: fragment,
      Comment: "",
      Type: "Suggest Improvement",
    });
    setFeedbackModalOpen(true);
  };

  const Egg = ({ line }) => {
    return line.toLowerCase().includes("easter egg") && Math.random() < 0.1 ? (
      <img
        alt="Software is mysterious!"
        src="/Ideas-are-illusions.jpg"
        style={{ height: "14em", margin: "10px 10px 10px 0" }}
      />
    ) : null;
  };

  const Question = ({ question }) => {
    const { text, categories } = formatQuery(question.text[0]);
    return (
      <Box>
        <Box
          sx={{
            padding: "6px 12px",
            backgroundColor: "secondary.main",
            color: "secondary.contrastText",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography>{text}</Typography>
          <Box>
            {categories.map((category, index) => (
              <Chip
                variant="outlined"
                color="primary"
                label={category}
                key={index}
                sx={{ margin: "2px", backgroundColor: "white" }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          marginBottom: "200px",
        }}
        className="scrollable-content"
      >
        {messages.length > 0 && (
          <>
            <Box>
              {messages.map((message, index) =>
                message.type === "question" ? (
                  <Question question={message} />
                ) : (
                  <Answer
                    text={message.text}
                    query={messages[index - 1].text}
                  />
                )
              )}
            </Box>
            <>
              {isQuerying.isQuerying && (
                <>
                  <Typography sx={{ marginBottom: "5px", padding: "10px" }}>
                    {isQuerying.message}
                  </Typography>
                  <LinearProgress />
                </>
              )}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </>
            <div ref={bottomRef} />
          </>
        )}
      </Box>
      <FeedbackModal
        open={feedbackModalOpen}
        handleClose={handleClose}
        feedbackModalData={feedbackModalData}
      />
    </>
  );
}

export default Conversation;
