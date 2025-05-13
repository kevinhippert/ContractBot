import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Typography } from "@mui/material/";

import Sidebar from "../../components/Sidebar";
import DocumentsView from "../documentsView/DocumentsView";
import QueryView from "../queryView/QueryView";

function MainView() {
  const [view, setView] = useState("queries");

  return (
    <Box sx={{ display: "flex", marginTop: "100px" }}>
      <Sidebar />
      <Box>
        <Box>
          <Button onClick={() => setView("queries")}>Queries</Button>
          <Button onClick={() => setView("documents")}>Documents</Button>
        </Box>
        {view === "queries" ? <QueryView /> : <DocumentsView />}
      </Box>
    </Box>
  );
}

export default MainView;
