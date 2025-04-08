import React, { useEffect, useState } from "react";
import { Paper, Box, Alert, Typography } from "@mui/material";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [answers, setAnswers] = useState([]);
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    // format only messages with type answer
    let answers = messages.filter((message) => message.type === "answer");
    setAnswers(formatAnswer(answers));
  }, [messages]);

  function formatAnswer(answer) {
    for (let i = 0; i < answer.length; i++) {
      let para = answer[i].toString().trim();
      console.log(para, typeof para);
      // Change **bold** to <b>bold</b>
      para = para.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      // Change *italic* to <i>italic</i>
      para = para.replace(/\*(.*?)\*/g, "<i>$1</i>");
      // Change _underline_ to <u>underline</u>
      para = para.replace(/_(.*?)_/g, "<u>$1</u>");

      // Various header levels
      /*
          if (para.match(/^####/)) {
              para = `<Typography variant="h4">{para.slice(4)}</Typography>`;
          }
          else if (para.match(/^###/)) {
              para = {variant: "h3", text=para.slice(3)}
          }
          else if (para.match(/^##/)) {
              para = `<Typography variant="h2">{para.slice(2)}</Typography>`;
          }
          else if (para.match(/^#/)) {
              para = `<Typography variant="h1">{para.slice(1)}</Typography>`;
          }
          else { */
      para = { variant: "body1", text: para };
      answer[i] = para;
    }

    console.log(answer);
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
                {answers.map((answer) => (
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
