import React from "react";
import {
  Box,
  TextField,
  FormControl,
  Autocomplete,
} from "@mui/material";  // REMOVED: Chip import
import { Controller } from "react-hook-form";

function Categories({ control }) {
  const categories = [
    "BENEFITS",
    "BUILDING SERVICES",
    "CERENITY_CARE_CENTER_CBA_2025-2026",
    "RIVERWAY_CLINICS_2022-2025",
  ];
  return (
    <Box sx={{ width: "100%", margin: "10px 0" }}>
      <FormControl sx={{ width: "100%" }}>
        <Controller
          name="category"  // CHANGED: Singular name (important!)
          control={control}
          defaultValue=""  // CHANGED: Empty string instead of array
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete
              // NO multiple prop!
              id="category-autocomplete"
              options={categories}
              value={value || ""}  // CHANGED: String value, with fallback to empty string
              onChange={(event, newValue) => {
                onChange(newValue || "");  // CHANGED: Ensure it's a string
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"  // CHANGED: Singular label
                  error={!!error}
                  helperText={error?.message}
                  placeholder="Select a category..."
                />
              )}
              // NO renderTags prop!
              // NO disableCloseOnSelect prop!
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered;
              }}
              isOptionEqualToValue={(option, value) => option === value}
            />
          )}
        />
      </FormControl>
    </Box>
  );
}

export default Categories;