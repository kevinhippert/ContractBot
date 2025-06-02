import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, List, MenuItem } from "@mui/material";
import ReactDOM from "react-dom"; // For portals

const RightClickMenu = ({
  x,
  y,
  selectedText,
  onClose,
  onGetLookups,
  onGiveFeedback,
}) => {
  const open = Boolean(selectedText && x !== null && y !== null); // Ensure coordinates are valid

  // Helper to call action and then close the menu
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
          // You can apply onContextMenu directly to the Paper component if you need to
          // prevent the browser context menu *if* someone right-clicks *on* your menu items.
          // However, onClose usually suffices for dismissing.
          onContextMenu: (e) => {
            e.preventDefault(); // Prevent browser context menu on our custom menu
            onClose(); // Close if right-clicked on itself
          },
        },
      }}
    >
      <List sx={{ padding: 0 }}>
        <MenuItem onClick={() => handleAction(onGetLookups)}>
          Get reference documents
        </MenuItem>
        <MenuItem onClick={() => handleAction(onGiveFeedback)}>
          Give Feedback
        </MenuItem>
      </List>
    </Dialog>
  );
};

export default RightClickMenu;
