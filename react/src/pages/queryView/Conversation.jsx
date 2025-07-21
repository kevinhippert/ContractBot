import React, { useEffect, useRef } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Answer from "./Answer";
import { Alert, Box, Typography, Chip } from "@mui/material";
import { formatQuery } from "../../utils/utils";

function Conversation({ messages, errorMessage, isQuerying }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const Question = ({ question }) => {
    const { text, categories } = formatQuery(question.text[0]);
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
  };

  return (
    <>
      <Box
        sx={{
          marginBottom: "200px",
        }}
        className="scrollable-content"
      >
        {messages.length > 0 && (
          <>
            <Box>
              {messages.map((message, index) =>
                message.type === "question" ? (
                  <Question question={message} key={index} />
                ) : (
                  <Answer
                    key={index}
                    text={message.text}
                    query={messages[index - 1]}
                    model={message.model}
                  />
                )
              )}
            </Box>
            <>
              {isQuerying.isQuerying && (
                <>
                  <Typography sx={{ marginBottom: "5px", padding: "10px" }}>
                    {isQuerying.message}
                  </Typography>
                  <LinearProgress />
                </>
              )}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </>
            <div ref={bottomRef} />
          </>
        )}
      </Box>
    </>
  );
}

export default Conversation;
