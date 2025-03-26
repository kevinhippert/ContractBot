import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Box, TextField, Button, Alert } from "@mui/material/";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Categories from "./Categories";
import QuestionInput from "./QuestionInput";
import api from "../../api/api";
import Conversation from "./Conversation";

// This component basically acts as a giant form, which registers inputs from various child components and handles submissions ond errors
function MainView() {
  const [serverError, setServerError] = useState(null);
  const [question, setQuestion] = useState({});
  const [answer, setAnswer] = useState({});
  const { register, control, handleSubmit } = useForm();

  // React Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return api.post("/add-query/", formData);
    },
    onSuccess: (response) => {
      // `response` is returned from mutationFn
      console.log(response);
      // make check-query call TODO
    },
    onError: (error) => {
      console.log("there was an error and here it is: ", error);
    },
  });

  const fetchReply = async () => {
    const res = await api.get(
      "user=frontend-1&nonce=blah&hash=foo&topic=bar&seq=1"
    );
    return res.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reply", "topicId"],
    queryFn: fetchReply,
  });

  const onSubmit = (question) => {
    setServerError(null); // Reset server error on new submission
    setQuestion(question);
    mutation.mutate(question);
  };

  return (
    <Box>
      <form style={{ display: "flex" }} onSubmit={handleSubmit(onSubmit)}>
        {/* Let's start with just one conversation */}
        {/* <Box>
          <Sidebar />
        </Box> */}
        <Box>
          <Categories control={control} />
          <Conversation question={question} answer={data} />
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
