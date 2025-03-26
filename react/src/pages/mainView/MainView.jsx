import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Box, TextField, Button, Alert } from "@mui/material/";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Categories from "./Categories";
import QuestionInput from "./QuestionInput";
import api from "../../api/api";
import Replies from "./Replies";

// This component basically acts as a giant form, which registers inputs from various child components and handles submissions ond errors
function MainView() {
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
    <Box>
      <form style={{ display: "flex" }} onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <Sidebar />
        </Box>
        <Box>
          <Categories />
          <Replies />
          <Box>
            {serverError && <Alert severity="error">{serverError}</Alert>}
          </Box>
          <QuestionInput register={register} />
        </Box>
      </form>
    </Box>
  );
}

export default MainView;
