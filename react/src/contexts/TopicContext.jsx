import React, { createContext, useState, useContext, useEffect } from "react";
import { createAuthenticationParams } from "../authentication/authentication";
import { createTopicId } from "../utils/utils";
import { useAuth } from "./AuthContext";
import api from "../api/api";

const TopicContext = createContext();

export function TopicProvider({ children }) {
  const [topics, setTopics] = useState([]);
  const { user } = useAuth();

  // useEffect(() => {
  //   console.log("topic context, topics: ", topics);
  // });

  useEffect(() => {
    // fetch and set topics
    async function fetchUserTopics() {
      try {
        const authParams = await createAuthenticationParams();
        console.log("authParams: ", authParams);
        const url = `/user-topics?${authParams}&OnBehalfOf=${user.userName}`;
        const res = await api.get(url);
        if (res.status === 200) {
          console.log("fetch user topics res: ", res);
          // TODO we need to fetch topic "names" as well as ids and handle it here
          const fetchedTopics = res.data.map((id) => createTopic(id));
          setTopics(fetchedTopics);
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
    if (topics.length === 0) {
      let initialTopic = createTopic();
      setTopics([initialTopic]);
      setNewCurrentTopic(initialTopic);
    }
  }, [topics]);

  const setNewCurrentTopic = (newCurrentTopic) => {
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: t.topicId === newCurrentTopic.topicId,
      }))
    );
  };

  const updateCurrentTopic = (updatedTopic) => {
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
  };

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
}

export const createTopic = (tId) => {
  const id = tId || createTopicId();

  const newTopic = {
    topicId: id,
    topicName: `New Topic - ${id.slice(0, 3)}`,
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
