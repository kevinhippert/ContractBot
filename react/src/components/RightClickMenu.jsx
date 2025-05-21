import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom"; // For portals

const RightClickMenu = ({
  x,
  y,
  selectedText,
  onClose,
  onAnalyze,
  onFeedback,
}) => {
  if (!selectedText) return null; // Don't show if no text is selected

  return ReactDOM.createPortal(
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: "white",
        border: "1px solid #ccc",
        boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
        borderRadius: "4px",
        zIndex: 1000,
        padding: "5px 0",
      }}
      onContextMenu={(e) => {
        // Prevent browser's context menu on our custom menu
        e.preventDefault();
        onClose(); // Close if right-clicked on itself
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li
          style={{ padding: "8px 15px", cursor: "pointer" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
          onClick={() => {
            onAnalyze(selectedText);
            onClose();
          }}
        >
          Analyze Text
        </li>
        <li
          style={{ padding: "8px 15px", cursor: "pointer" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f0f0f0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
          onClick={() => {
            onFeedback(selectedText);
            onClose();
          }}
        >
          Give Feedback
        </li>
      </ul>
    </div>,
    document.body // Portal target
  );
};

export default RightClickMenu;
