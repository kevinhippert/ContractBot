import * as React from "react";
import { Box, TextField, Button } from "@mui/material/";

export default function Form() {
  return (
    <Box
      component="form"
      sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-basic"
        label="Ask your question"
        variant="outlined"
      />
      <Button>Ask</Button>
    </Box>
  );
}
