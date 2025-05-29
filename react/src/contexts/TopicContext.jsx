import React, { createContext, useState, useContext, useEffect } from "react";
import { createAuthenticationParams } from "../authentication/authentication";
import { createTopicId } from "../utils/utils";
import { useAuth } from "./AuthContext";
import { getTopicDisplayName } from "../utils/utils";
import api from "../api/api";

const TopicContext = createContext();

export function TopicProvider({ children }) {
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log("currentTopic: ", currentTopic);
  }, [currentTopic]);

  useEffect(() => {
    // fetch and set topics
    async function fetchUserTopics() {
      try {
        const authParams = await createAuthenticationParams();
        const url = `/user-topics?${authParams}&OnBehalfOf=${user.userName}`;
        const res = await api.get(url);
        if (res.status === 200) {
          setTopics(
            Object.entries(res.data).map(([id, name]) => {
              return createTopic(id, name);
            })
          );
        }
      } catch (error) {
        console.log("Its an error: ", error);
      }
    }

    if (user.isAuthenticated) {
      fetchUserTopics();
    }
  }, [user]);

  useEffect(() => {
    console.log("checking topics length, current topic is: ", currentTopic);
    console.log("topics are: ", topics);
    if (user.isAuthenticated && topics?.length === 0) {
      let initialTopic = createTopic();
      setTopics([initialTopic]);
      setNewCurrentTopic(initialTopic);
    } else if (user.isAuthenticated) {
      console.log("user is authenticated and there are topics: ", topics);
      setCurrentTopic(topics[0]);
    }
  }, [topics]);

  const setNewCurrentTopic = (newCurrentTopic) => {
    console.log("setNewCurrentTopic: ", newCurrentTopic);
    setCurrentTopic(newCurrentTopic);
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: t.topicId === newCurrentTopic.topicId,
      }))
    );
  };

  const updateCurrentTopic = (updatedTopic) => {
    // Typically used to update the sequence
    setTopics((prevTopics) =>
      prevTopics.map((topic) => {
        if (topic.topicId === updatedTopic.topicId) {
          return { ...topic, ...updatedTopic };
        } else {
          return topic;
        }
      })
    );
  };

  const updateTopicName = (topicId, newTopicName) => {
    // TODO this can be part of updateCurrentTopic ?
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.topicId === topicId
          ? { ...topic, topicName: getTopicDisplayName(topicId, newTopicName) }
          : topic
      )
    );
  };

  const value = {
    setNewCurrentTopic,
    updateCurrentTopic,
    topics,
    updateTopicName,
    setTopics,
    currentTopic,
  };

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
}

export const createTopic = (id = null, name = null) => {
  let topicId = id || createTopicId();
  let topicName = getTopicDisplayName(topicId, name);

  const newTopic = {
    topicId,
    topicName,
    isCurrent: true,
    seq: 1,
  };
  return newTopic;
};

export function useTopic() {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error("useTopic must be used within a TopicProvider");
  }
  return context;
}
