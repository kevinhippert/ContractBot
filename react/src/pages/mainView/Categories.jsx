import React from "react";
import { Button, Box } from "@mui/material";

function Categories() {
  const categories = [
    "wages",
    "benefits",
    "PTO",
    "my boss is a jerk",
    "california",
    "gig work",
    "power to the people",
  ];

  return (
    <>
      <Box>
        {categories.map((category) => (
          <Button>{category}</Button>
        ))}
      </Box>
    </>
  );
}

export default Categories;
