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
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

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
  const [feedbackFormData, setFeedbackFormData] = useState({});

  useEffect(() => {
    console.log(feedbackModalData);
    console.log("feedbackFormData: ", feedbackFormData);
  }, [open, feedbackFormData]);

  useEffect(() => {
    setFeedbackFormData(feedbackModalData);
  }, []);

  const handleCancel = () => {
    handleClose();
  };

  const handleOk = () => {
    // send feedback
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFeedbackFormData((prevData) => ({
      ...prevData,
      Type: type,
    }));
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Send Feedback</DialogTitle>
      <DialogContent dividers>
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
              value="Note Missing Info"
              control={<Radio />}
              label="Note Missing Info"
            />
            <FormControlLabel
              value="Note Unclear Phrasing"
              control={<Radio />}
              label="Note Unclear Phrasing"
            />
            <FormControlLabel
              value="Note Off Topic"
              control={<Radio />}
              label="Note Off Topic"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
