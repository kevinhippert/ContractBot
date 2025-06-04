import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import { Box, Typography } from "@mui/material/";
import FragmentAccordion from "./FragmentAccordion";
import Question from "./Question";

function DocumentsView() {
  const [lookups, setLookups] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const { currentTopic } = useTopic();

  // useEffect(() => {
  //   console.log("am i rendering twice?");
  // }, []);

  // useEffect(() => {
  //   console.log("lookups: ", lookups);
  // }, [lookups]);

  useEffect(() => {
    getLookupDocuments();
  }, [currentTopic]);

  const getLookupDocuments = async () => {
    try {
      const authParams = await createAuthenticationParams();
      const url = `/get-lookups?${authParams}&Topic=${currentTopic.topicId}`;
      const res = await api.get(url);
      if (res.data) {
        const transformed = transformLookupData(res.data.Lookups);
        setLookups(transformed);
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
      const fragments = lookup.Fragments; // This is an array of fragment objects [{ "answerFragment": ["document1", "document2", "document3"] }]
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
          Object.entries(lookup).map(([query, fragmentArray]) => {
            return (
              <Box key={query}>
                <Question query={query} />
                {fragmentArray.map((fragmentObject) => {
                  return Object.entries(fragmentObject).map(
                    ([fragment, documents]) => (
                      <FragmentAccordion
                        key={fragment}
                        fragment={fragment}
                        docs={documents}
                      />
                    )
                  );
                })}
              </Box>
            );
          })
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

//  (<FragmentAccordion frags={frags} key={answerFrag} />);
