import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Box, Alert } from "@mui/material/";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Categories from "./Categories";
import QuestionInput from "./QuestionInput";
import api from "../../api/api";
import Conversation from "./Conversation";
import { generateNonce } from "../../utils/utils";

// This component basically acts as a giant form, which registers inputs from various child components and handles submissions ond errors
function MainView() {
  const [serverError, setServerError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);

  const { register, control, handleSubmit, setValue } = useForm();

  // React Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (formData) => {
      return api.post(
        "/add-query?User=Frontend-1&Nonce=bloh&Hash=foo",
        formData
      );
    },
    onSuccess: (response) => {
      // `response` is returned from mutationFn
      console.log(response);
      // start query
      setIsQuerying(true);
      queryClient.invalidateQueries(["reply", "topicId"]);
    },
    onError: (error) => {
      console.log("there was an error and here it is: ", error);
    },
  });

  const query = useQuery({
    queryKey: ["reply", "topicId"],
    queryFn: async () => {
      const res = await api.get(
        "check-query?User=Frontend-1&Nonce=blah&Hash=foo&Topic=bar&Seq=1"
      );
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "answer",
          seq: res.data.Seq,
          topic: res.data.Topic,
          text: res.data.Answer,
        },
      ]);
      setIsQuerying(false);
      setQueryEnabled(false);
      return res.data;
    },
    enabled: isQuerying,
  });

  const onSubmit = (question) => {
    setServerError(null); // Reset server error on new submission
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "question",
        seq: "not sure",
        topic: "123ABC",
        text: [question.question],
      },
    ]);
    let formData = {
      Topic: "123ABC",
      Query: question.question,
      Modifiers: { Region: null, Category: question.categories },
    };
    mutation.mutate(formData);
    setQueryEnabled(true);
    setValue("question", "");
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
          <Conversation
            messages={messages}
            query={query}
            isQuerying={isQuerying}
          />
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
