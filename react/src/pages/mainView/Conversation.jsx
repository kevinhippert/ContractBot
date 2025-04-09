import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [thread, setThread] = useState([]);

  useEffect(() => {
    setThread(formatThread(messages));
  }, [messages]);

  function formatThread(messages) {
    for (let i = 0; i < messages.length; i++) {
      let message = messages[i];
      if (message.type === "question") {
        let para = message[i].text.toString().trim();
        // Change **bold** to <b>bold</b>
        para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        // Change *italic* to <i>italic</i>
        para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
        // Change _underline_ to <u>underline</u>
        para = para.replace(/_(.*?)_/g, "<u>$1</u>");

        if (para.match(/^####/)) {
          message[i] = { variant: "h1", text: para };
        } else if (para.match(/^###/)) {
          message[i] = { variant: "h3", text: para };
        } else if (para.match(/^##/)) {
          message[i] = { variant: "h2", text: para };
        } else if (para.match(/^#/)) {
          message[i] = { variant: "h1", text: para };
        } else {
          message[i] = { variant: "body1", text: para };
        }
      } else if (message.type === "message") {
        for (let i = 0; i < message.length; i++) {
          let para = message[i].text.toString().trim();
          message[i] = { variant: "body2", text: para };
        }
      }
      return messages;
    }
  }

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>
            {messages.map((m, index) => (
              <Paper
                key={index}
                style={{
                  background: m.type === "question" ? "#fcfcfc" : "#eee6ff",
                  marginTop: "5px",
                }}
              >
                {thread.map((p) => (
                  <Typography variant="body2">{p.text}</Typography>
                ))}
              </Paper>
            ))}
          </Box>
          {isQuerying && <Paper>Thinking...</Paper>}
          {errorMessage && (
            <Alert severity="error">Whoopsy. {errorMessage}</Alert>
          )}
        </>
      )}
    </>
  );
}

export default Conversation;
