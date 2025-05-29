import React from "react";
import { formatQuery } from "../utils/utils";
import { Box, Chip, Typography } from "@mui/material";

function Question({ query }) {
  const { text, categories } = formatQuery(query);
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
