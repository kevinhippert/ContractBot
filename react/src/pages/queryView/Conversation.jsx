import React, { useEffect, useState, useRef } from "react";
import { Alert, Box, Button, Paper, Typography, Tooltip } from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/api";
import { useTopic } from "../../contexts/TopicContext";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import LinearProgress from "@mui/material/LinearProgress";

function Conversation({ messages, errorMessage, isQuerying }) {
  const { currentTopic } = useTopic();
  const bottomRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const Egg = ({ line }) => {
    return line.toLowerCase().includes("easter egg") && Math.random() < 0.1 ? (
      <img
        alt="Software is mysterious!"
        src="/Ideas-are-illusions.jpg"
        style={{ height: "14em", margin: "10px 10px 10px 0" }}
      />
    ) : null;
  };

  const addLookup = async (fragment, seq) => {
    // make addLookup request
    try {
      const authParams = await createAuthenticationParams();
      const url = `/add-lookup?${authParams}`;
      const body = {
        Topic: currentTopic.topicId,
        Seq: seq,
        Fragment: fragment,
        Count: 5,
        Threshold: 1,
      };
      const res = await api.post(url, body);
      // we might do something with this response in the future
    } catch (error) {
      // handle error
      console.error("There was an error andn here it is: ", error);
    }
  };

  const Question = ({ text }) => {
    return (
      <Box>
        <Box
          sx={{
            padding: "6px 12px",
            backgroundColor: "#c6a0f063",
            borderRadius: "4px",
          }}
        >
          {text.map((line) => (
            <Typography>{line}</Typography>
          ))}
        </Box>
      </Box>
    );
  };

  const Answer = ({ message }) => {
    let text = message.text;
    return (
      <Box>
        {text.map((line) => {
          return (
            <>
              <Box sx={{ display: "flex" }}>
                <Egg line={line} />
                <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
                {line.length > 240 && (
                  <Button
                    sx={{
                      minWidth: "auto",
                    }}
                    color="primary"
                    onClick={() => addLookup(line, message.seq)}
                  >
                    {/* TODO mark "already added" fragments */}
                    <Tooltip
                      title={`Add reference material for this answer to the Documents tab.`}
                    >
                      <PlaylistAddIcon />
                    </Tooltip>
                  </Button>
                )}
              </Box>
            </>
          );
        })}
      </Box>
    );
  };

  return (
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
                <Question text={message.text} />
              ) : (
                <Answer message={message} />
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
  );
}

export default Conversation;
