import React, { useState, useRef, useCallback, useEffect } from "react";
import api from "../../api/api";
import { Alert, Box, Snackbar, Tooltip } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RightClickMenu from "../../components/RightClickMenu";
import Egg from "../../components/Egg";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import { FeedbackModal } from "./FeedbackModal";
import { useAuth } from "../../contexts/AuthContext";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import InsertCommentIcon from "@mui/icons-material/InsertComment";

function Answer({ text, query, model }) {
  const { currentTopic } = useTopic();
  const { user } = useAuth();
  const answerContentRef = useRef(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalData, setFeedbackModalData] = useState({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [rightClickMenu, setRightClickMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedText: "",
  });

  // RIGHTCLICK MENU
  const handleRightClick = useCallback(
    (e) => {
      // preserve normal right-click behavior if feedback modal is open
      if (feedbackModalOpen) {
        return;
      }

      // prevent default browser context menu
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
        // if no text is selected, close any active menu
        setRightClickMenu({ ...rightClickMenu, visible: false });
      }
    },
    [rightClickMenu, feedbackModalOpen]
  );

  // close context menu when clicking anywhere else
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

  // FEEDBACK MODAL
  const handleOpenFeedbackModal = (fragment = null) => {
    let feedbackText = fragment || rightClickMenu.selectedText;
    setFeedbackModalData({
      Topic: currentTopic.topicId,
      OnBehalfOf: user.userName,
      Query: query.text[0],
      Fragment: feedbackText,
      Comment: "",
      Type: "Suggest Improvement",
    });
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
  };

  // LOOKUPS
  const handleGetLookups = async (fragment = null) => {
    let lookupText = fragment || rightClickMenu.selectedText;
    try {
      const authParams = await createAuthenticationParams();
      const url = `/add-lookup?${authParams}`;
      const body = {
        Topic: currentTopic.topicId,
        Seq: query.seq,
        Fragment: lookupText,
        Count: 5,
        Threshold: 1,
      };
      const res = await api.post(url, body);
      if (res.status === 200) {
        showAlert(
          "Request for document references was submitted successfully. Results will be shown in the Documents tab.",
          "success"
        );
      } else {
        showAlert(
          "There was a problem submitting your request. Please try again later",
          "error"
        );
      }
    } catch (error) {
      // handle error
      console.error("There was an error andn here it is: ", error);
      showAlert(
        "There was a problem submitting your request. Please try again later",
        "error"
      );
    }
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  return (
    <Box
      ref={answerContentRef}
      onContextMenu={handleRightClick}
      style={{
        minHeight: "200px",
        userSelect: "text", // ensure text can be selected
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {text.map((line, index) => {
          return (
            <Box key={index} sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex" }}>
                <Egg line={line} />
                <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
                {line.length > 240 && (
                  <Box
                    sx={{ display: "flex", alignItems: "center", margin: "5px" }}
                  >
                    <Tooltip
                      title={`Add reference material for this answer to the Documents tab`}
                    >
                      <PlaylistAddIcon
                        sx={{ cursor: "pointer" }}
                        color="primary"
                        onClick={() => handleGetLookups(line)}
                      />
                    </Tooltip>
                    <Tooltip title={`Give feedback on this answer`}>
                      <InsertCommentIcon
                        color="primary"
                        sx={{ marginLeft: "4px", cursor: "pointer" }}
                        onClick={() => handleOpenFeedbackModal(line)}
                      />
                    </Tooltip>
                  </Box>
                )}
              </Box>
              {index === text.length - 1 && model && (
                <Box sx={{ fontSize: "12px", color: "#666", marginTop: "2px", marginBottom: "8px" }}>
                  Model: {model}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {rightClickMenu.visible && (
        <RightClickMenu
          x={rightClickMenu.x}
          y={rightClickMenu.y}
          selectedText={rightClickMenu.selectedText}
          onClose={() =>
            setRightClickMenu({ ...rightClickMenu, visible: false })
          }
          onGetLookups={handleGetLookups}
          onGiveFeedback={handleOpenFeedbackModal}
        />
      )}
      <FeedbackModal
        open={feedbackModalOpen}
        handleClose={closeFeedbackModal}
        feedbackModalData={feedbackModalData}
      />
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={closeAlert}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Answer;
