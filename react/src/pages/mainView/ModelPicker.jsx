import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function ModelPicker({ register, setValue }) {
  const models = [
    {
      name: "deepseek-r1:32b | default",
      description: "Best quality answers, slowest response",
      value: "default",
    },
    {
      name: "gemma3:27b",
      description: "Mid quality answers, ~30s for response",
      value: "faster",
    },
    {
      name: "deepseek-r1:7b",
      description: "quality is sus, fastest response",
      value: "fastest",
    },
  ];

  return (
    <>
      <InputLabel>Model</InputLabel>
      <Select {...register("model")}>
        {models &&
          models.map((model) => (
            <MenuItem key={model.value} value={model.value}>
              {model.name} | {model.description}
            </MenuItem>
          ))}
      </Select>
    </>
  );
}
