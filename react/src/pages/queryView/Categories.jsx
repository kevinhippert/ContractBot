import React from "react";
import {
  Button,
  Box,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
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
    <Box sx={{ width: "50%", margin: "10px 0" }}>
      <FormControl sx={{ width: "100%" }}>
        <InputLabel id="categories-label">Categories</InputLabel>
        <Controller
          name="categories"
          control={control}
          defaultValue={[]}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Select
              labelId="categories-label" // Link label to select
              id="categories-select"
              multiple
              value={value || []} // Ensure value is always an array, even if undefined initially
              onChange={(event) => {
                // MUI Select for multiple selection passes the array of selected values directly
                onChange(event.target.value); // Pass the updated array directly to react-hook-form's onChange
              }}
              input={
                <OutlinedInput id="select-multiple-chip" label="Categories" />
              } // Label for the input itself
              renderValue={(selected) => selected.join(", ")}
              error={!!error} // Apply error state
              // helperText={error ? error.message : null} // Display validation message if needed
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  <Checkbox checked={value && value.includes(category)} />
                  <ListItemText primary={category} />
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
    </Box>
  );
}

export default Categories;
