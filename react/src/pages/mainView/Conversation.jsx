import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";
import LinearProgress from '@mui/material/LinearProgress';
import "../../styles/conversation.css";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    formatThread(messages);
  }, [messages]);

  function formatThread(messages) {
    let result = [];
    let messageObj;
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      if (!message.text) {
        message = {
          variant: "body1",
          text: "This is taking a moment...",
          type: "answer",
        };
      } else {
        let para = message.text.join("\n").trim();
        // Change **bold** to <b>bold</b>
        para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        // Change *italic* to <i>italic</i>
        para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
        // Change _underline_ to <u>underline</u>
        para = para.replace(/_(.*?)_/g, "<u>$1</u>");

        if (para.match(/^#### /)) {
          messageObj = { variant: "h4", text: para.slice(5) };
        } else if (para.match(/^### /)) {
          messageObj = { variant: "h3", text: para.slice(4) };
        } else if (para.match(/^## /)) {
          messageObj = { variant: "h2", text: para.slice(3) };
        } else if (para.match(/^# /)) {
          messageObj = { variant: "h1", text: para.slice(2) };
        } else {
          messageObj = { variant: "body1", text: para };
        }
        message = { ...messageObj, type: message.type };
      }
      result.push(message);
    }
    setTexts(result);
  }

  function ShowAnswer({ text, index }) {
    if (text.type === "question") {
      return (
        <Paper className="question-class" key={index} elevation="8">
          <Typography variant={text.variant}>{text.text}</Typography>
        </Paper>
      );
    } else if (text.type === "answer") {
      return (
        <Paper className="answer-class" key={index} elevation="0">
          <Typography variant={text.variant}>{text.text}</Typography>
        </Paper>
      );
    }
  }

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>
            {texts.map((text, index) => (
              <ShowAnswer text={text} />
            ))}
          </Box>
          {isQuerying.isQuerying && (
            <Paper>
              <Typography>{isQuerying.message}</Typography>
              <LinearProgress />
            </Paper>
          )}
          {errorMessage && (
            <Alert severity="error">Whoopsy. {errorMessage}</Alert>
          )}
        </>
      )}
    </>
  );
}

export default Conversation;
