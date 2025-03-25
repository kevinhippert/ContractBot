import React from "react";
import Sidebar from "./Sidebar";
import Form from "./Form";
import { Typography, Box } from "@mui/material/";

function MainView() {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Form />
    </Box>
  );
}

export default MainView;
