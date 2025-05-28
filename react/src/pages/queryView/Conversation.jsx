import React, { useEffect, useState, useRef } from "react";
import { Alert, Box, Button, Paper, Typography, Tooltip } from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/api";
import { useTopic } from "../../contexts/TopicContext";
import { useAuth } from "../../contexts/AuthContext";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InsertCommentIcon from "@mui/icons-material/InsertComment";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import LinearProgress from "@mui/material/LinearProgress";
import { FeedbackModal } from "./FeedbackModal";

function Conversation({ messages, errorMessage, isQuerying }) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({});
  const { currentTopic } = useTopic();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleClose = () => {
    setFeedbackModalOpen(false);
  };

  const handleFeedbackModalOpen = (answer, fragment, query) => {
    setFeedbackModalData({
      Topic: answer.topic,
      OnBehalfOf: user.userName,
      Query: query[0],
      Fragment: fragment,
      Comment: "",
      Type: "Suggest Improvement",
    });
    setFeedbackModalOpen(true);
  };

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
            backgroundColor: "secondary.main",
            color: "secondary.contrastText",
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

  const Answer = ({ answer, query }) => {
    let text = answer.text;
    return (
      <Box>
        {text.map((line) => {
          return (
            <>
              <Box sx={{ display: "flex" }}>
                <Egg line={line} />
                <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
                {line.length > 240 && (
                  <>
                    <Button
                      sx={{
                        minWidth: "auto",
                      }}
                      color="primary"
                      onClick={() => addLookup(line, answer.seq)}
                    >
                      {/* TODO mark "already added" fragments */}
                      <Tooltip
                        title={`Add reference material for this answer to the Documents tab.`}
                      >
                        <PlaylistAddIcon />
                      </Tooltip>
                    </Button>
                    <Button
                      sx={{
                        minWidth: "auto",
                      }}
                      color="primary"
                      onClick={() =>
                        handleFeedbackModalOpen(answer, line, query)
                      }
                    >
                      <Tooltip title={`Give feedback on this response`}>
                        <InsertCommentIcon />
                      </Tooltip>
                    </Button>
                  </>
                )}
              </Box>
            </>
          );
        })}
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
                  <Question text={message.text} />
                ) : (
                  <Answer answer={message} query={messages[index - 1].text} />
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
      <FeedbackModal
        open={feedbackModalOpen}
        handleClose={handleClose}
        feedbackModalData={feedbackModalData}
      />
    </>
  );
}

export default Conversation;
