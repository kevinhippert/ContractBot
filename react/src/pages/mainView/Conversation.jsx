import React, { useEffect, useState } from "react";
import { Paper, Box, Alert } from "@mui/material";

function formatAnswer(answer) {
    const paragraphs = answer.split('\n')
    for (i = 0; i < paragraphs.length; i++) {
        let para = paragraphs[i].trim();
        // Change **bold** to <b>bold</b>
        para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
        // Change *italic* to <i>italic</i>
        para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
        // Change _underline_ to <u>underline</u>
        para = para.replace(/_(.*?)_/g, "<u>$1</u>");

        // Various header levels
        if (para.match(/^####/)) {
            para = `<Typography variant="h4">${para.slice(4)}</Typography>`;
        }
        else if (para.match(/^###/)) {
            para = `<Typography variant="h3">${para.slice(3)}</Typography>`;
        }
        else if (para.match(/^##/)) {
            para = `<Typography variant="h2">${para.slice(2)}</Typography>`;
        }
        else if (para.match(/^#/)) {
            para = `<Typography variant="h1">${para.slice(1)}</Typography>`;
        }
        else {
            para = `<Typography variant="body1">${para}</Typography>`;
        }
        paragraphs[i] = para;
    }
    return paragraphs.join('\n');
}

function Conversation({ messages, errorMessage, isQuerying }) {
  // useEffect(() => {
  //   console.log(messages);
  // }, [messages]);

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
                {formatAnswer(m.text)}
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
