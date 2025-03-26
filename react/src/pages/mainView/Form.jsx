import React, { useState } from "react";
import { Box, TextField, Button, Alert } from "@mui/material/";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import api from "../../api/api";

export default function Form() {
  const [serverError, setServerError] = useState(null);

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  // React Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return api.post("/add-query/", formData);
    },
    onSuccess: (response) => {
      // `response` is returned from mutationFn
      console.log(response);
    },
    onError: (error) => {
      console.log("there was an error and here it is: ", error);
    },
  });

  const onSubmit = (data) => {
    setServerError(null); // Reset server error on new submission
    mutation.mutate(data);
  };

  return (
    <>
      <Box>{serverError && <Alert severity="error">{serverError}</Alert>}</Box>
      <form component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Ask your question"
          variant="outlined"
          {...register("question")}
        />
      </form>
    </>
  );
}
