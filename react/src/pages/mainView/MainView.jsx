import React from "react";
import Sidebar from "./Sidebar";
import Form from "./Form";
import { Typography, Box } from "@mui/material/";
import Categories from "./Categories";

function MainView() {
  return (
    <Box sx={{ display: "flex" }}>
      <Box>
        <Sidebar />
      </Box>
      <Box>
        <Categories />
        <Form />
      </Box>
    </Box>
  );
}

export default MainView;
