import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

function Conversation({ messages, query, isQuerying }) {
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    console.log("query: ", query.isLoading);
  }, [query]);

  if (query.isError) return <div>Error: {query.error.message}</div>;

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
          {isQuerying && <Paper>Thinking...</Paper>}
        </>
      )}
    </>
  );
}

export default Conversation;
