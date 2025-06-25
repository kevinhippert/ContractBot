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
    if (user.isAuthenticated) {
      if (topics.length === 0) {
        // no topics exist yet, create a new one and set to current
        let initialTopic = createTopic();
        setTopics([initialTopic]);
        setNewCurrentTopic(initialTopic);
      } else if (!currentTopic) {
        // user just logged in, set first topic to current
        setCurrentTopic(topics[0]);
      }
    }
  }, [topics]);

  // only for setting a new topic which must be added to the array of topics
  const setNewCurrentTopic = (newCurrentTopic) => {
    setCurrentTopic(newCurrentTopic);
    setTopics((prevTopics) =>
      prevTopics.map((t) => ({
        ...t,
        isCurrent: newCurrentTopic ? t.topicId === newCurrentTopic.topicId : false,
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

  // delete a topic
  const deleteTopic = async (topicId) => {
    try {
      const authParams = await createAuthenticationParams();
      const url = `/topic?${authParams}&OnBehalfOf=${user.userName}&Topic=${topicId}`;
      const res = await api.delete(url)
      if (res.status === 200) {
        setTopics((prevTopics) => prevTopics.filter((t) => t.topicId !== topicId));
        if (currentTopic?.topicId === topicId) {
          setNewCurrentTopic(null);
        } else {
          console.log('Failed to delete topic:', res.status)
        }
      }
    } catch (error) {
      const status = error?.request.status
      if (status === 403) {
        console.log('Topic not created on backend, removing on frontend only')
        setTopics((prevTopics) => prevTopics.filter((t) => t.topicId !== topicId));
        if (currentTopic?.topicId === topicId) {
          setNewCurrentTopic(null);
        }
      } else {
        console.log("Its an error: ", error)
      }
    }
  }

  const value = {
    setNewCurrentTopic,
    updateCurrentTopic,
    topics,
    updateTopicName,
    setTopics,
    currentTopic,
    deleteTopic
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
