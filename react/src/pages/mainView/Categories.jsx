import React from "react";
import { Button, Box } from "@mui/material";
import { Controller } from "react-hook-form";

function Categories({ control }) {
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
      <Controller
        name="categories"
        control={control}
        defaultValue={[]}
        render={({ field: { onChange, value } }) => {
          const handleCategoryClick = (category) => {
            const updatedCategories = value.includes(category)
              ? value.filter((c) => c !== category)
              : [...value, category];
            onChange(updatedCategories);
          };

          return (
            <Box>
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  variant={value.includes(category) ? "contained" : "outlined"} //add visual feedback
                >
                  {category}
                </Button>
              ))}
            </Box>
          );
        }}
      />
    </>
  );
}

export default Categories;
