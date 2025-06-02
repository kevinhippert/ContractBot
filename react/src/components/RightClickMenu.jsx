import React from "react";
import { Dialog, List, MenuItem } from "@mui/material";

const RightClickMenu = ({
  x,
  y,
  selectedText,
  onClose,
  onGetLookups,
  onGiveFeedback,
}) => {
  const open = Boolean(selectedText && x !== null && y !== null); // ensure coordinates are valid

  const handleAction = (actionCallback) => {
    actionCallback(selectedText);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            padding: "10px",
            position: "absolute",
            top: y,
            left: x,
            margin: 0,
            boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
            borderRadius: "4px",
            zIndex: 1000,
            minWidth: "150px",
          },
          onContextMenu: (e) => {
            e.preventDefault(); // prevent browser context menu this component
            e.stopPropagation();
            onClose(); // close if right-clicked on itself
          },
        },
      }}
    >
      <List sx={{ padding: 0 }}>
        <MenuItem onClick={() => handleAction(onGetLookups)}>
          Request Reference Documents
        </MenuItem>
        <MenuItem onClick={() => handleAction(onGiveFeedback)}>
          Give Feedback
        </MenuItem>
      </List>
    </Dialog>
  );
};

export default RightClickMenu;
