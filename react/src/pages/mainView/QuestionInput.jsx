import React from "react";
import { Box, TextField, Button, Alert } from "@mui/material/";

function QuestionInput({ register }) {
  return (
    <>
      <TextField
        label="Ask your question"
        variant="outlined"
        {...register("question")}
      />
    </>
  );
}

export default QuestionInput;
