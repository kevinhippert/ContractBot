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
            {messages.map((m, index) => (
                <Paper key={index}
                  style={{ background: m.type === "question"? "#f2f2f2" : "#ffe6ff" }}>
                  {m.text.join("\n")}
                </Paper>
              ))}
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
