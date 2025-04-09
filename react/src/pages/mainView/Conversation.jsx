import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [fullAnswer, setAnswer] = useState([]);
  const [query, setQuery] = useState([]);

  useEffect(() => {
    // format only messages with type answer
    let fullAnswer = messages.filter((message) => message.type === "answer");
    setAnswer(formatAnswer(fullAnswer));
  }, [messages]);

  useEffect(() => {
    let queryText = messages.filter((message) => message.type === "question");
    setQuery(queryText);
  }, [messages]);


  function formatAnswer(answer) {
    for (let i = 0; i < answer.length; i++) {
      let para = answer[i].text.toString().trim();

      // Change **bold** to <b>bold</b>
      para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      // Change *italic* to <i>italic</i>
      para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
      // Change _underline_ to <u>underline</u>
      para = para.replace(/_(.*?)_/g, "<u>$1</u>");

      if (para.match(/^####/)) {
          answer[i] = { variant: "h1", text: para };
      }
      else if (para.match(/^###/)) {
          answer[i] = { variant: "h3", text: para };
      }
      else if (para.match(/^##/)) {
          answer[i] = { variant: "h2", text: para };
      }
      else if (para.match(/^#/)) {
          answer[i] = { variant: "h1", text: para };
      }
      else {
          answer[i] = { variant: "body1", text: para };
      }
    }
    return answer;
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
                {query.map((q) => (
                  <Typography variant="body2">
                    {q.text}
                  </Typography>
                ))}
                {fullAnswer.map((answer) => (
                  <Typography variant={answer.variant}>
                    {answer.text}
                  </Typography>
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
