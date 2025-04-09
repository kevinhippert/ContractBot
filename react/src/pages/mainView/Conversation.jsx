import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";
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
          text: "Sorry, I couldn't find an answer",
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

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>
            {texts.map((text, index) => (
              <Paper
                className={
                  text.type === "question" ? "question-class" : "answer-class"
                }
                key={index}
              >
                <Typography variant={text.variant}>{text.text}</Typography>
              </Paper>
            ))}
          </Box>
          {isQuerying.isQuerying && (
            <Paper>
              <Typography>{isQuerying.message}</Typography>
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
