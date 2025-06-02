import React, { useState, useRef, useCallback, useEffect } from "react";
import api from "../../api/api";
import { Alert, Box, Snackbar } from "@mui/material";
import { createAuthenticationParams } from "../../authentication/authentication";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RightClickMenu from "../../components/RightClickMenu";
import Egg from "../../components/Egg";
import { useTopic } from "../../contexts/TopicContext";
import { FeedbackModal } from "./FeedbackModal";
import { useAuth } from "../../contexts/AuthContext";

function Answer({ text, query }) {
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

  const handleRightClick = useCallback(
    (e) => {
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
    [rightClickMenu]
  ); // Added rightClickMenu to dependency array for spreading

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

  const handleOpenFeedbackModal = () => {
    setFeedbackModalData({
      Topic: currentTopic.topicId,
      OnBehalfOf: user.userName,
      Query: query[0],
      Fragment: rightClickMenu.selectedText,
      Comment: "",
      Type: "Suggest Improvement",
    });
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
  };

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  const handleGetLookups = async () => {
    // make addLookup request
    try {
      const authParams = await createAuthenticationParams();
      const url = `/add-lookup?${authParams}`;
      const body = {
        Topic: currentTopic.topicId,
        Seq: currentTopic.seq,
        Fragment: rightClickMenu.selectedText,
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

  return (
    <Box
      sx={{ display: "flex", position: "relative" }}
      ref={answerContentRef}
      onContextMenu={handleRightClick}
      style={{
        border: "1px solid #ddd",
        padding: "20px",
        minHeight: "200px",
        userSelect: "text", // ensure text can be selected
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
          // variant="filled"
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
