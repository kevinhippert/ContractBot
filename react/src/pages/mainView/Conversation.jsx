import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

function Conversation({ message, scrollRef }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (message) {
      setMessages((prevMessages) => [...prevMessages]);
      message = null;
    }
  }, [message]);

  return (
    <>
      <Box>Conversation goes here</Box>
    </>
  );
}

export default Conversation;
