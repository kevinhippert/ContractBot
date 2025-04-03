import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Box, Container } from "@mui/material/";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Categories from "./Categories";
import QuestionInput from "./QuestionInput";
import api from "../../api/api";
import Conversation from "./Conversation";
import { createAuthenticationParams } from "../../authentication/authentication";

// This component basically acts as a giant form, which registers inputs from various child components and handles submissions ond errors
function MainView() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const { register, control, handleSubmit, setValue } = useForm();

  // React Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (formData) => {
      try {
        const authParams = await createAuthenticationParams();
        const url = `/add-query?${authParams}`;
        return api.post(url, formData);
      } catch (error) {
        console.log("mutation error: ", error);
      }
    },
    onSuccess: (response) => {
      // `response` is returned from mutationFn
      console.log(response);
      // start query
      setIsQuerying(true);
    },
    onError: (error) => {
      setErrorMessage(error);
      console.log("there was an error and here it is: ", error);
    },
  });

  const query = useQuery({
    queryKey: ["reply", "topicId"],
    queryFn: async () => {
      try {
        const authParams = await createAuthenticationParams();
        const topic = "123ABC"; // createTopicId();
        const seq = 1; // Start from 1 for the first question
        const url = `check-query?${authParams}&Topic=${topic}&Seq=${seq}`;
        const res = await api.get(url);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            type: "answer",
            seq: res.data.Seq,
            topic: res.data.Topic,
            text: res.data.Answer.join("\n"),
          },
        ]);
        setIsQuerying(false);
        return res.data;
      } catch (error) {
        console.log("fetch error: ", error);
      }
    },
    enabled: isQuerying,
  });

  const onSubmit = (question) => {
    setErrorMessage(null); // Reset server error on new submission
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "question",
        seq: question.seq,
        topic: question.topic,
        text: [question.question],
      },
    ]);
    let formData = {
      Topic: "123ABC",
      Query: question.question,
      Modifiers: { Region: null, Category: question.categories },
    };
    mutation.mutate(formData);
    setValue("question", "");
  };

  return (
    <Container
      sx={{
        marginTop: "20px",
        "&.MuiContainer-root": {
          padding: 0,
        },
      }}
    >
      <form style={{ display: "flex" }} onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ width: "200px" }}>
          <Sidebar />
        </Box>
        <Box>
          <Categories control={control} />
          <Conversation
            messages={messages}
            errorMessage={errorMessage}
            isQuerying={isQuerying}
          />
          <QuestionInput register={register} style={{ marginTop: "10px" }} />
        </Box>
      </form>
    </Container>
  );
}

export default MainView;
