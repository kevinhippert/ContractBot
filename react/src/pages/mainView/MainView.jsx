import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { useTopic } from "../../contexts/TopicContext";
import { Box, Container } from "@mui/material/";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Categories from "./Categories";
import QuestionInput from "./QuestionInput";
import api from "../../api/api";
import Conversation from "./Conversation";
import { createAuthenticationParams } from "../../authentication/authentication";

// This component basically acts as a giant form, which registers inputs from various child
// components and handles submissions ond errors
function MainView() {
  const { topics, updateCurrentTopic, updateTopicName } = useTopic();
  const [currentTopic, setCurrentTopic] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [messages, setMessages] = useState([]);
  const [retries, setRetries] = useState(0);

  const { register, control, handleSubmit, setValue } = useForm();

  useEffect(() => {
    setCurrentTopic(topics.find((topic) => topic.isCurrent));
  }, [topics]);

  const onSubmit = async (question) => {
    setErrorMessage(null); // Reset server error on new submission
    setIsQuerying(true);
    setValue("question", "");
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
      Topic: currentTopic.topicId,
      Query: question.question,
      Modifiers: { Region: null, Category: question.categories },
    };
    if (currentTopic.seq === 1) {
      // TODO something broken about this
      updateTopicName(currentTopic.topicId, formData.Query);
    }
    addQuery(formData);
  };

  const addQuery = async (formData) => {
    try {
      const authParams = await createAuthenticationParams();
      const url = `/add-query?${authParams}`;
      const response = await api.post(url, formData);

      if (response.status === 200) {
        // Successful POST, start GET check-query
        checkQueryWithRetries(response.data.Seq);
      } else {
        // POST failed
        setErrorMessage("Failed to submit query.");
      }
    } catch (error) {
      setErrorMessage("Error connecting to server.");
      console.error("Error submitting query:", error);
    } finally {
      setIsQuerying(false); // End loading
    }
  };

  const checkQueryWithRetries = async (querySeq, maxRetries = 3) => {
    updateCurrentTopic({
      topicId: currentTopic?.topicId,
      seq: querySeq,
    });
    let currentRetry = 0;

    while (currentRetry < maxRetries) {
      try {
        const authParamsGet = await createAuthenticationParams();
        const topic = currentTopic?.topicId;
        const seq = querySeq;
        const url = `check-query?${authParamsGet}&Topic=${topic}&Seq=${seq}`;
        const response = await api.get(url);
        console.log(response);

        if (response.data.Answer !== null) {
          console.log("Answer is not null: ", response.data);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              type: "answer",
              seq: response.data.Seq,
              topic: response.data.Topic,
              text: response.data.Answer,
            },
          ]);
          return response.data; // Success, return the data
        } else {
          console.log("retrying");
          currentRetry++;
          setRetries(currentRetry);
          console.log(`Attempt ${currentRetry}: Answer is null. Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        console.log(`Error fetching data: ${error.message}`);
        throw error; // Propagate the error if you want the calling code to handle it
      }
    }

    console.log(`Failed to get answer after ${maxRetries} attempts.`);
    return null; // Or throw an error if you want to indicate failure
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
          <QuestionInput register={register} />
        </Box>
      </form>
    </Container>
  );
}

export default MainView;
