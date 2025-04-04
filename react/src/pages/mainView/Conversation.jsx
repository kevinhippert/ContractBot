import React, { useEffect, useState } from "react";
import { Paper, Box, Alert } from "@mui/material";

function Conversation({ messages, errorMessage, isQuerying }) {
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>
            {messages.map((m, index) => {
              {m.type === "question" &&
                <Paper key={index} style={{ background: "lightgray" }}>
                  {m.text.join("\n")}
                </Paper>}
              {m.type === "answer" &&
                <Paper key={index} style={{ background: "lightblue" }}>
                  {m.text.join("\n")}
                </Paper>
              }
            }
            <br/>
          </Box>
          {isQuerying && <Paper>Thinking...</Paper>}
          {errorMessage && (
            <Alert severity="error">
              Whoopsy. {errorMessage.response.data.detail}
            </Alert>
          )}
        </>
      )}
    </>
  );
}

export default Conversation;
