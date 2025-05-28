import React from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
function Question({ text }) {
  const regex = /:\s*([A-Z\s]+)\n/g;

  let categories = [];
  if (text.includes(".....")) {
    let result = text.split(".....");
    text = result[1];
    categories = Array.from(result[0].matchAll(regex), (match) =>
      match[1].trim()
    );
  }
  return (
    <Box>
      <Box
        sx={{
          padding: "6px 12px",
          backgroundColor: "secondary.main",
          color: "secondary.contrastText",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography>{text}</Typography>
        <Box>
          {categories.map((category, index) => (
            <Chip
              variant="outlined"
              color="primary"
              label={category}
              key={index}
              sx={{ margin: "2px", backgroundColor: "white" }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Question;
