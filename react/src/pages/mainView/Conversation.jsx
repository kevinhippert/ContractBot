import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
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
      for (let para of message.text ?? []) {
        para = para.trim();
        // TODO: figure out how to add inline markup in a JSX compatible way
        // Change **bold** to <b>bold</b>
        // para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        // Change *italic* to <i>italic</i>
        // para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
        // Change _underline_ to <u>underline</u>
        // para = para.replace(/_(.*?)_/g, "<u>$1</u>");

        if (para.match(/^#### /)) {
          // h4 header
          messageObj = {
            variant: "h4",
            text: para.slice(5).replace(/\*\*/g, ""),
          };
        } else if (para.match(/^### /)) {
          // h3 header
          messageObj = {
            variant: "h3",
            text: para.slice(4).replace(/\*\*/g, ""),
          };
        } else if (para.match(/^## /)) {
          // h2 header
          messageObj = {
            variant: "h2",
            text: para.slice(3).replace(/\*\*/g, ""),
          };
        } else if (para.match(/^# /)) {
          // h1 header
          messageObj = {
            variant: "h1",
            text: para.slice(2).replace(/\*\*/g, ""),
          };
        } else if (para.match(/^\*\*.*\*\*$/)) {
          // h4 header with asterisks
          messageObj = { variant: "h4", text: para.slice(2, para.length - 2) };
        } else if (para.match(/^\d\./)) {
          // h6 header from numbered list
          messageObj = { variant: "h6", text: para.replace(/\*\*/g, "") };
        } else if (para.match(/^- /)) {
          // bullet list from hyphen
          messageObj = {
            variant: "body1",
            text: para.replace(/^- /, " • ").replace(/\*\*/g, ""), // Lead is U+2001 (em-quad)
          };
        } else if (para.match(/^\* /)) {
          // bullet list from asterisks
          messageObj = {
            variant: "body1",
            text: para.replace(/^\* /, " • ").replace(/\*\*/g, ""), // Lead is U+2001 (em-quad)
          };
        } else if (para.match(/^-+$/)) {
          // dash line
          messageObj = {
            variant: "body1",
            text: "—————————————————————————————",
          };
        } else {
          messageObj = { variant: "body1", text: para };
        }
        message = { ...messageObj, type: message.type };
        result.push(message);
      }
      setTexts(result);
    }
  }

  function ShowAnswer({ text, index }) {
    if (text.type === "question") {
      return (
        <Paper
          sx={{ marginBottom: "10px", padding: "5px 12px" }}
          className="question-class"
          key={index}
          elevation="2"
        >
          <Typography variant={text.variant}>{text.text}</Typography>
        </Paper>
      );
    } else if (text.type === "answer") {
      return (
        <Paper
          sx={{ marginBottom: "5px" }}
          className="answer-class"
          key={index}
          elevation="0"
        >
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
              <ShowAnswer key={index} text={text} />
            ))}
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
            {errorMessage && (
              <Alert severity="error">Whoopsy. {errorMessage}</Alert>
            )}
          </>
        </>
      )}
    </>
  );
}

export default Conversation;
