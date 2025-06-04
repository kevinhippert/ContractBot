import React from "react";
import { formatQuery } from "../../utils/utils";
import { Box, Chip, Typography } from "@mui/material";

function Question({ query }) {
  const { text, categories } = formatQuery(query);
  return (
    <Box
      sx={{
        padding: "6px 0",
        color: "secondary.contrastText",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
      }}
    >
      <Typography>
        <b>Query: </b>
        {text}
      </Typography>
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
  );
}

export default Question;
