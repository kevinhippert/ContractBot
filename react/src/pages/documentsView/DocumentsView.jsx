import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import { Box, Paper, Typography, Divider } from "@mui/material/";
import { formatQuery } from "../../utils/utils";
import FragmentAccordion from "./FragmentAccordion";

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
        // setLookups(res.data.Lookups);
        restructureLookups(res.data.Lookups);
      } else {
        console.log("No data in response: ", res);
      }
    } catch (error) {
      // handle error
      console.error("There was an error and here it is: ", error);
    }
  };

  const restructureLookups = (lookups) => {
    let newLookupsStructure = [];

    lookups.forEach((lookup) => {
      let currentQuery = "";
      let currentLookup = {};
      if (lookup["Query"] !== currentQuery) {
        newLookupsStructure.push(currentLookup);
        currentQuery = lookup["Query"];
        currentLookup[lookup["Query"]] = lookup["Fragments"];
      } else {
        let fragsToAppend = lookup["Fragments"];
        let fragsAppended =
          currentLookup[lookup["Fragments"]].push(fragsToAppend);
        currentLookup[lookup["Fragments"]] = fragsAppended;
      }
    });
    setLookups(newLookupsStructure);
  };

  const Query = ({ queryText }) => {
    let { text } = formatQuery(queryText);
    return (
      <Box
        sx={{
          margin: "4px 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography>
          Query: <i>{text}</i>
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="scrollable-content" sx={{ paddingBottom: "100px" }}>
      <Typography variant="h6">Reference Documents</Typography>
      <Divider sx={{ margin: "15px 0" }} />
      {lookups.map((lookup) =>
        Object.entries(lookup).map(([query, fragment]) => (
          <Box key={query}>
            <Query queryText={query} />
            {Object.values(fragment).map((frags) => (
              <FragmentAccordion frags={frags} />
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}

export default DocumentsView;
