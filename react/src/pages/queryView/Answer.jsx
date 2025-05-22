import React, { useState, useRef, useCallback, useEffect } from "react";
import api from "../../api/api";
import { Alert, Box, Button, Paper, Typography, Tooltip } from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RightClickMenu from "../../components/RightClickMenu";

function Answer({ text }) {
  const contentRef = useRef(null);
  const [rightClickMenu, setRightClickMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedText: "",
  });

  // 1. Capture text selection and right-click
  const handleRightClickMenu = useCallback(
    (e) => {
      console.log("right click happened");
      // Prevent default browser context menu
      e.preventDefault();

      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0) {
        setRightClickMenu({
          visible: true,
          x: e.clientX, // Mouse X coordinate
          y: e.clientY, // Mouse Y coordinate
          selectedText: text,
        });
      } else {
        // If no text is selected, just close any active menu
        setRightClickMenu({ ...rightClickMenu, visible: false });
      }
    },
    [rightClickMenu]
  ); // Added rightClickMenu to dependency array for spreading

  // 2. Close context menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => {
      if (rightClickMenu.visible) {
        setRightClickMenu({ ...rightClickMenu, visible: false });
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [rightClickMenu]);

  // 3. Handlers for context menu options
  const handleAnalyzeText = (text) => {
    console.log("Sending text for analysis:", text);
    // TODO: Implement your server-side API call here
    alert("Text sent for analysis (check console)!");
  };

  const handleOpenFeedbackModal = (text) => {
    setTextForFeedback(text);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setTextForFeedback("");
  };

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
    <Box
      sx={{ display: "flex", position: "relative" }}
      ref={contentRef}
      onContextMenu={handleRightClickMenu}
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        minHeight: "200px",
        userSelect: "text", // Ensure text can be selected
        cursor: "default",
      }}
    >
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
      {rightClickMenu.visible && (
        <RightClickMenu
          x={rightClickMenu.x}
          y={rightClickMenu.y}
          selectedText={rightClickMenu.selectedText}
          onClose={() =>
            setRightClickMenu({ ...rightClickMenu, visible: false })
          }
          onAnalyze={handleAnalyzeText}
          onFeedback={handleOpenFeedbackModal}
        />
      )}
    </Box>
  );
}

export default Answer;
