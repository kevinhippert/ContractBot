import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import { Box, Paper, Button, Container, Typography } from "@mui/material/";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        setLookups(res.data.Lookups);
      } else {
        console.log("No data in response: ", res);
      }
    } catch (error) {
      // handle error
      console.error("There was an error and here it is: ", error);
    }
  };

  const Query = ({ text }) => {
    return (
      <Box>
        <Typography>
          <i>Query:</i> {text}
        </Typography>
      </Box>
    );
  };

  const Fragment = ({ text }) => {
    let frag = text.slice(0, 200) + "...";
    return (
      <>
        <Typography>
          <i>Reference fragment:</i> {frag}
        </Typography>
      </>
    );
  };

  const Document = ({ text }) => {
    let metaData;
    let docLines;
    if (text.includes(".....")) {
      let result = text.split(".....");
      metaData = result[0].split("\n");
      docLines = result[1].split("\n");
    } else {
      return (
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#f4f4f4",
            margin: "15px 0",
            display: "flex",
            width: "100%",
            borderRadius: "8px",
          }}
        >
          <Box sx={{ padding: "10px 10px" }}>
            <Typography>{text}</Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#f4f4f4",
          margin: "15px 0",
          display: "flex",
          width: "100%",
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            padding: "10px 10px",
            width: "20%",
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          {metaData.map((line) => (
            <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
          ))}
        </Box>
        <Box sx={{ padding: "10px 10px" }}>
          {docLines.map((line) => (
            <ReactMarkdown children={line} remarkPlugins={[remarkGfm]} />
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box className="scrollable-content" sx={{ paddingBottom: "100px" }}>
      <Typography variant="h6">{`Reference Documents`}</Typography>
      {lookups.length === 0 ? (
        <Typography>No documents to show</Typography>
      ) : (
        lookups.map((lookup, lookupIndex) => (
          <Box key={`doc-${lookupIndex}`}>
            <Query text={lookup.Query} />
            {lookup.Fragments.map((fragmentObject, fragmentObjIndex) => (
              <Box key={`fragment-obj-${lookupIndex}-${fragmentObjIndex}`}>
                {Object.entries(fragmentObject).map(([frag, docs]) => (
                  <Box
                    key={`fragment-entry-${lookupIndex}-${fragmentObjIndex}-${frag}`}
                  >
                    <Fragment text={frag} />

                    {docs.length > 0 ? (
                      docs.map((doc, docIndex) => (
                        <Box
                          key={`fragment-value-${lookupIndex}-${fragmentObjIndex}-${frag}-${docIndex}`}
                        >
                          <Document text={doc} />
                        </Box>
                      ))
                    ) : (
                      <Document
                        text={
                          "No reference documents were found for this text fragment."
                        }
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}

export default DocumentsView;
