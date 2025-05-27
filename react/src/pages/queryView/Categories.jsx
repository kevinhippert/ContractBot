import React from "react";
import {
  Button,
  Box,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { Controller } from "react-hook-form";

function Categories({ control }) {
  const categories = [
    "BENEFITS",
    "BUILDING SERVICES",
    "CONTRACT LANGUAGE",
    "EDUCATION",
    "GRIEVANCES",
    "HEALTHCARE",
    "IMMIGRATION",
    "PRIVATE",
    "PTO",
    "PUBLIC",
    "WAGES",
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
            <Box sx={{ margin: "18px 0" }}>
              <Select
                multiple
                // value={personName}
                onChange={handleCategoryClick}
                input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          );
        }}
      />
    </>
  );
}

export default Categories;
