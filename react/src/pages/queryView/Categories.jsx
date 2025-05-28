import React from "react";
import {
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
    <Box sx={{ width: "100%", margin: "10px 0" }}>
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
              value={value || []} // value is always an array, even if undefined initially
              onChange={(event) => {
                onChange(event.target.value); // pass the updated array directly to react-hook-form's onChange
              }}
              input={
                <OutlinedInput id="select-multiple-chip" label="Categories" />
              }
              renderValue={(
                selected // CHIPS
              ) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((chipValue) => (
                    <Chip
                      key={chipValue}
                      label={chipValue}
                      onDelete={(event) => {
                        // remove Chip by clicking the X
                        event.stopPropagation();
                        onChange(value.filter((val) => val !== chipValue));
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation(); // keep dropdown from opening when clicking Chip
                      }}
                    />
                  ))}
                </Box>
              )}
              error={!!error}
            >
              {categories.map(
                (
                  category // dropdown menu
                ) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={value && value.includes(category)} />
                    <ListItemText primary={category} />
                  </MenuItem>
                )
              )}
            </Select>
          )}
        />
      </FormControl>
    </Box>
  );
}

export default Categories;
