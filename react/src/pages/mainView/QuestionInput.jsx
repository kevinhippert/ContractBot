import React from "react";
import { Box, TextField, Button, Alert } from "@mui/material/";

function QuestionInput({ register, isQuerying }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default form submission
      event.target.form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <>
      <TextField
        label="Ask your question"
        variant="outlined"
        disabled={isQuerying.isQuerying}
        style={{ width: "80%", marginTop: "10px" }}
        {...register("question")}
        onKeyDown={handleKeyDown}
      />
    </>
  );
}

export default QuestionInput;
