import React from "react";
import { Box, TextField, Button, Alert } from "@mui/material/";

function QuestionInput({ register, isQuerying }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.form.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  return (
    <>
      <TextField
        label="Ask your question"
        multiline
        variant="outlined"
        disabled={isQuerying.isQuerying}
        style={{ width: "80%", margin: "1em 0 2em 0", height: "5em" }}
        {...register("question")}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant="contained"
        type="submit"
        onClick={handleKeyDown}
        disabled={isQuerying.isQuerying}
        style={{ width: "10%", margin: "1.3em 0 2em 1em", height: "3.5em" }}
      >
        Ask
      </Button>
    </>
  );
}

export default QuestionInput;
