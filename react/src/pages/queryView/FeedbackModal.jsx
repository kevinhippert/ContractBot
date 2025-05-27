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
} from "@mui/material";

export function FeedbackModal({ open, handleClose, feedbackModalData }) {
  const [feedbackFormData, setFeedbackFormData] = useState(
    feedbackModalData || {}
  );

  useEffect(() => {
    console.log(feedbackModalData);
    console.log("feedbackFormData: ", feedbackFormData);
  }, [open, feedbackFormData]);

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
      console.log(res);
    } catch (error) {
      // handle error
      console.error("There was a problem and here it is: ", error);
    }
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
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
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
          maxRows={10}
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
  );
}
