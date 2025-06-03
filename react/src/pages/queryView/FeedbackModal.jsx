import React, { useState, useEffect } from "react";
import { createAuthenticationParams } from "../../authentication/authentication";
import api from "../../api/api";
import {
  Button,
  DialogContent,
  DialogActions,
  Dialog,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";

export function FeedbackModal({ open, handleClose, feedbackModalData }) {
  const [feedbackFormData, setFeedbackFormData] = useState(
    feedbackModalData || {}
  );
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");

  useEffect(() => {
    setFeedbackFormData(feedbackModalData);
  }, [feedbackModalData]);

  const handleCancel = () => {
    handleClose();
  };

  const handleSendFeedback = async () => {
    try {
      const authParams = await createAuthenticationParams();
      const url = `/recommend?${authParams}`;
      const res = await api.post(url, feedbackFormData);
      handleClose();

      if (res.status === 200) {
        showAlert(
          "Your feedback has been sent. Thank you for your contribution!",
          "success"
        );
      } else {
        showAlert(
          "There was a problem submitting your feedback. Please try again later",
          "error"
        );
      }
    } catch (error) {
      showAlert(
        "There was a problem submitting your feedback. Please try again later",
        "error"
      );
      console.error("There was a problem and here it is: ", error);
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

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFeedbackFormData((prevData) => ({
      ...prevData,
      Type: type,
    }));
  };

  const handleCommentChange = (e) => {
    const comment = e.target.value;
    setFeedbackFormData((prevData) => ({
      ...prevData,
      Comment: comment,
    }));
  };

  return (
    <>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 575 } }}
        open={open}
      >
        <DialogContent dividers>
          <Typography
            sx={{
              color: "#575757",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "7px",
              border: "1px #00000008 solid",
              fontFamily: "serif",
            }}
          >
            {feedbackFormData.Fragment}
          </Typography>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="Suggest Improvement"
              value={feedbackFormData.Type}
              onChange={handleTypeChange}
            >
              <FormControlLabel
                value="Suggest Improvement"
                control={<Radio />}
                label="Suggest Improvement"
              />
              <FormControlLabel
                value="Promote Answer"
                control={<Radio />}
                label="Promote Answer"
              />
              <FormControlLabel
                value="Make Correction"
                control={<Radio />}
                label="Make Correction"
              />
              <FormControlLabel
                value="Add Missing Info"
                control={<Radio />}
                label="Add Missing Info"
              />
              <FormControlLabel
                value="Clarify Phrasing"
                control={<Radio />}
                label="Clarify Phrasing"
              />
              <FormControlLabel
                value="Flag as Off Topic"
                control={<Radio />}
                label="Flag as Off Topic"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            sx={{ width: "100%", marginTop: "10px" }}
            variant="outlined"
            placeholder="Suggested language or additional feedback"
            multiline
            rows={8}
            onChange={handleCommentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" autoFocus onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSendFeedback}>
            Send Feedback
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}
