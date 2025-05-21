import React, { useEffect, useState, useRef } from "react";
import { Alert, Box, Button, Paper, Typography, Tooltip } from "@mui/material";
import { useTopic } from "../../contexts/TopicContext";
import LinearProgress from "@mui/material/LinearProgress";
import Answer from "./Answer";

function Conversation({ messages, errorMessage, isQuerying }) {
  const { currentTopic } = useTopic();
  const bottomRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const Question = ({ text }) => {
    return (
      <>
        <Box
          sx={{
            padding: "6px 12px",
            backgroundColor: "#c6a0f063",
            borderRadius: "4px",
          }}
        >
          {text.map((line) => (
            <Typography>{line}</Typography>
          ))}
        </Box>
      </>
    );
  };

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>
            {messages.map((message, index) =>
              message.type === "question" ? (
                <Question text={message.text} />
              ) : (
                <Answer text={message.text} />
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
    </>
  );
}

export default Conversation;
