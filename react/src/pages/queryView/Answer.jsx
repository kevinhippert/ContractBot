import React from "react";
import api from "../../api/api";
import { Alert, Box, Button, Paper, Typography, Tooltip } from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Answer({ text }) {
  const Egg = ({ line }) => {
    return line.toLowerCase().includes("easter egg") && Math.random() < 0.1 ? (
      <img
        alt="Software is mysterious!"
        src="/Ideas-are-illusions.jpg"
        style={{ height: "14em", paddingLeft: "2em" }}
      />
    ) : null;
  };

  const addLookup = async (fragment) => {
    // make addLookup request
    try {
      const authParams = await createAuthenticationParams();
      const url = `/add-lookup?${authParams}`;
      const body = {
        Topic: currentTopic.topicId,
        Seq: currentTopic.seq,
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

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {text.map((line) => {
          return (
            <>
              <Egg line={line} />
              <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
            </>
          );
        })}
        <Box>
          <Button
            sx={{
              position: "absolute",
              bottom: "0",
              right: "0",
              minWidth: "auto",
            }}
            color="primary"
            onClick={() => addLookup(text.join())}
          >
            {/* TODO mark "already added" fragments */}
            <Tooltip
              title={`Add reference material for this answer to the Documents tab.`}
            >
              <PlaylistAddIcon />
            </Tooltip>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Answer;
