import React, { createContext, useState, useContext, useEffect } from "react";
import { createTopicId } from "../utils/utils";

const TopicContext = createContext();

export function TopicProvider({ children }) {
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    if (topics.length === 0) {
      let initialTopic = createTopic();
      setTopics([initialTopic]);
      setNewCurrentTopic(initialTopic);
    }
  }, []);

  const setNewCurrentTopic = (newCurrentTopic) => {
    setCurrentTopic((prevTopic) => {
      if (!prevTopic) {
        return newCurrentTopic;
      }
      return { ...prevTopic, ...newCurrentTopic };
    });
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: t.topicId === newCurrentTopic.topicId,
      }))
    );
  };

  const updateCurrentTopic = (updatedTopicData) => {
    setCurrentTopic((prevTopic) => {
      if (!prevTopic) {
        return updatedTopicData;
      }
      return { ...prevTopic, ...updatedTopicData };
    });
  };

  const updateTopicName = (topicId, newTopicName) => {
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
    currentTopic,
    setNewCurrentTopic,
    updateCurrentTopic,
    topics,
    updateTopicName,
    setTopics,
  };

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
}

export const createTopic = () => {
  const topicId = createTopicId();

  const newTopic = {
    topicId: topicId,
    topicName: `New Topic - ${topicId.slice(0, 3)}`,
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
