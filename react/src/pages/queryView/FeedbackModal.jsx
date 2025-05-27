import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";

// {
//     "Topic": "DGQIn+5troxI",
//     "OnBehalfOf": "Calico_Seders", // Not Frontend_1, but regular user
//     "Query": "What's the meaning of life?",
//     "Fragment": "It don't mean a thing if you ain't got that swing.",
//     "Comment": "Duke Ellington frequently lent his wisdom to song lyrics.
//                He correctly noted that you need that swing to mean anything.",
//     "Type": "Suggest Improvement"
// }

export function FeedbackModal({ open, handleClose, feedbackModalData }) {
  const [feedbackFormData, setFeedbackFormData] = useState(feedbackModalData);

  useEffect(() => {
    console.log(feedbackFormData);
  }, [feedbackFormData]);

  const handleCancel = () => {
    handleClose();
  };

  const handleOk = () => {
    // send feedback
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Send Feedback</DialogTitle>
      <DialogContent dividers>stuff</DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
