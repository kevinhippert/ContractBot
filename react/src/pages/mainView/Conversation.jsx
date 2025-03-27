import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

function Conversation({ messages }) {
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <>
      {messages.length > 0 && (
        <>
          <Box>Conversation goes here</Box>
          <Box>
            {messages.map((m, index) => (
              <Paper key={index}>{m.text[0]}</Paper>
            ))}
          </Box>
        </>
      )}
    </>
  );
}

export default Conversation;
