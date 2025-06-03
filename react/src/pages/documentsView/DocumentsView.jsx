import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import { Box, Paper, Typography, Divider } from "@mui/material/";
import { formatQuery } from "../../utils/utils";
import FragmentAccordion from "./FragmentAccordion";
import Question from "./Question";

function DocumentsView() {
  const [lookups, setLookups] = useState([]);
  const { currentTopic } = useTopic();

  useEffect(() => {
    getLookupDocuments();
  }, [currentTopic]);

  const getLookupDocuments = async () => {
    try {
      const authParams = await createAuthenticationParams();
      const url = `/get-lookups?${authParams}&Topic=${currentTopic.topicId}`;
      const res = await api.get(url);
      if (res.data) {
        setLookups(transformLookupData(res.data.Lookups));
      } else {
        console.log("No data in response: ", res);
      }
    } catch (error) {
      // handle error
      console.error("There was an error and here it is: ", error);
    }
  };

  const transformLookupData = (lookups) => {
    // temporary object to aggregate fragments by Query
    const aggregatedQueries = {};

    lookups.forEach((lookup) => {
      const query = lookup.Query;
      const fragments = lookup.Fragments; // This is an array of fragment objects

      // If the query already exists in our aggregated object,
      // concatenate the new fragments to the existing ones.
      if (aggregatedQueries[query]) {
        aggregatedQueries[query] = aggregatedQueries[query].concat(fragments);
      } else {
        // If the query is new, add it with its fragments array.
        aggregatedQueries[query] = fragments;
      }
    });

    // convert the aggregated object into the desired array of objects format
    const newLookupsStructure = Object.entries(aggregatedQueries).map(
      ([query, fragments]) => {
        return { [query]: fragments };
      }
    );
    return newLookupsStructure;
  };

  return (
    <Box className="scrollable-content" sx={{ paddingBottom: "100px" }}>
      <Typography variant="h6" sx={{ marginBottom: "20px" }}>
        Reference Documents
      </Typography>
      {lookups.length > 0 ? (
        lookups.map((lookup) =>
          Object.entries(lookup).map(([query, fragmentOjbect]) => (
            <Box key={query}>
              <Question query={query} />
              {Object.values(fragmentOjbect).map((frags, index) => (
                <FragmentAccordion frags={frags} key={index} />
              ))}
            </Box>
          ))
        )
      ) : (
        <Typography>
          No references have been requested on this topic.
        </Typography>
      )}
    </Box>
  );
}

export default DocumentsView;
