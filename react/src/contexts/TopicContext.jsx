import React, { createContext, useState, useContext } from "react";

const TopicContext = createContext();

export function TopicProvider({ children }) {
  const [currentTopic, setCurrentTopic] = useState(null); // TODO maybe not null?

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
