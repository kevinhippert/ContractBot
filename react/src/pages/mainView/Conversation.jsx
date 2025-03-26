import React, { useEffect, useState } from "react";
import { Paper, Box } from "@mui/material";

function Conversation({ question, answer, scrollRef }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (answer) {
      setAnswers((prevAnswers) => [...prevAnswers]);
      answer = null;
    }
  }, [answer]);

  useEffect(() => {
    if (question) {
      setQuestions((prevQuestions) => [...prevQuestions]);
      question = null;
    }
  }, [question]);

  return (
    <>
      <Box>Conversation goes here</Box>
    </>
  );
}

export default Conversation;
