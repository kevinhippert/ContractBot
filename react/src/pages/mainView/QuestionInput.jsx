import React from "react";
import { Box, TextField, Button, Alert } from "@mui/material/";

function QuestionInput({ register, isQuerying }) {
  return (
    <>
      <TextField
        label="Ask your question"
        variant="outlined"
        disabled={isQuerying.isQuerying}
        style={{ width: "80%", marginTop: "10px" }}
        {...register("question")}
      />
    </>
  );
}

export default QuestionInput;
