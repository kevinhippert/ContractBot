import React, { useState } from "react";
import { Paper, Box } from "@mui/material";

function Replies() {
  const replies = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis no",
    "xercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum ",
  ];

  return (
    <>
      <Box>
        {replies.map((reply, index) => (
          <Paper key={index} sx={{ padding: "20px" }}>
            {reply}
          </Paper>
        ))}
      </Box>
    </>
  );
}

export default Replies;
