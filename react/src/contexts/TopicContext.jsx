import React, { createContext, useState, useContext, useEffect } from "react";
import { createAuthenticationParams } from "../authentication/authentication";
import { createTopicId } from "../utils/utils";
import { useAuth } from "./AuthContext";
import api from "../api/api";

const TopicContext = createContext();

export function TopicProvider({ children }) {
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const { user } = useAuth();

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
    if (topics?.length === 0) {
      let initialTopic = createTopic();
      setTopics([initialTopic]);
      setNewCurrentTopic(initialTopic);
    }
  }, [topics]);

  const setNewCurrentTopic = (newCurrentTopic) => {
    console.log("setNewCurrentTopic");
    setCurrentTopic(newCurrentTopic);
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: t.topicId === newCurrentTopic.topicId,
      }))
    );
  };

  const updateCurrentTopic = (updatedTopic) => {
    console.log("updateCurrentTopic");
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
    console.log("updateTopicName");
    if (newTopicName.length > 100) {
      newTopicName = newTopicName.slice(0, 100) + "...";
    }
    setTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.topicId === topicId
          ? { ...topic, topicName: newTopicName }
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

export const createTopic = (id, name = null) => {
  let topicId = id || createTopicId();
  let topicName = name || `New Topic - ${topicId.slice(0, 3)}`;

  const newTopic = {
    topicId,
    topicName,
    isCurrent: true,
    seq: 1,
  };
  console.log("new topic: ", newTopic);
  return newTopic;
};

export function useTopic() {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error("useTopic must be used within a TopicProvider");
  }
  return context;
}
