import React from "react";
import {
  Box,
  TextField,        // CHANGED: Replaced Select with TextField for Autocomplete
  Chip,
  FormControl,
  Autocomplete,     // ADDED: New component
  Checkbox,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';  // ADDED: New import
import CheckBoxIcon from '@mui/icons-material/CheckBox';                          // ADDED: New import
import { Controller } from "react-hook-form";

function Categories({ control }) {
  const categories = [
    "BENEFITS",
    "BUILDING SERVICES",
    "CERENITY_CARE_CENTER_CBA_2025-2026",
    "RIVERWAY_CLINICS_2022-2025",
  ];

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;      // ADDED
  const checkedIcon = <CheckBoxIcon fontSize="small" />;           // ADDED

  return (
    <Box sx={{ width: "100%", margin: "10px 0" }}>
      <FormControl sx={{ width: "100%" }}>
        <Controller
          name="categories"
          control={control}
          defaultValue={[]}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Autocomplete                                       // CHANGED: Select → Autocomplete
              multiple
              id="categories-autocomplete"                     // CHANGED: New ID
              options={categories}                             // ADDED: Explicit options prop
              disableCloseOnSelect                             // ADDED: New prop
              value={value || []}
              onChange={(event, newValue) => {                 // CHANGED: Different event signature
                onChange(newValue);                            // SIMPLIFIED: Direct value passing
              }}
              renderInput={(params) => (                       // ADDED: Replaces input prop
                <TextField
                  {...params}
                  label="Categories"                           // MOVED: From InputLabel
                  error={!!error}
                  helperText={error?.message}                  // ADDED: Error display
                  placeholder="Type to search or select..."    // ADDED: New feature
                />
              )}
              renderTags={(selected, getTagProps) =>          // CHANGED: Replaces renderValue
                selected.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                    color="primary"
                    onDelete={() => {                         // SIMPLIFIED: No event handling needed
                      const newValue = value.filter((val) => val !== option);
                      onChange(newValue);
                    }}
                  />
                ))
              }
              renderOption={(props, option, { selected }) => (  // ADDED: Replaces MenuItem mapping
                <li {...props}>                                
                  <Checkbox
                    icon={icon}                                // ADDED: Custom icons
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}                         // CHANGED: Simplified check
                  />
                  {option}                                     
                </li>
              )}
              filterOptions={(options, { inputValue }) => {    // ADDED: Search functionality
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered;
              }}
              freeSolo={false}                                 // ADDED: New prop
              clearOnBlur={true}                               // ADDED: New prop
              isOptionEqualToValue={(option, value) => option === value}  // ADDED: New prop
            />
          )}
        />
      </FormControl>
    </Box>
  );
}

export default Categories;