import React, { createContext, useState, useContext, useEffect } from "react";
import { createTopicId } from "../utils/utils";

const TopicContext = createContext();

export const createInitialTopic = () => {
  const initialTopicId = createTopicId(); // Assuming you have createTopicId
  return {
    topicId: initialTopicId,
    topicName: `New Topic - ${initialTopicId.slice(0, 3)}`,
    isCurrent: true,
    seq: 1,
  };
};

export function TopicProvider({ children }) {
  const [currentTopic, setCurrentTopic] = useState(null);

  useEffect(() => {
    if (!currentTopic) {
      setCurrentTopic(createInitialTopic());
    }
  }, [currentTopic]);

  const updateCurrentTopic = (updatedTopicData) => {
    setCurrentTopic((prevTopic) => {
      if (!prevTopic) {
        return updatedTopicData;
      }
      return { ...prevTopic, ...updatedTopicData };
    });
  };

  const value = {
    currentTopic,
    updateCurrentTopic,
  };

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
}

export function useTopic() {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error("useTopic must be used within a TopicProvider");
  }
  return context;
}
