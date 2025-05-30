import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material/";
import { formatQuery } from "../../utils/utils";

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
          <b>Query:</b> {text}
          <br />
          <b>Answer Fragment:</b>
        </Typography>
      </Box>
    );
  };

  const Fragment = ({ text }) => {
    return (
      <>
        <Box sx={{ margin: "0px 24px" }}>
          <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
        </Box>
      </>
    );
  };

  const Document = ({ text }) => {
    if (!text.includes(".....")) {
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

    const result = text.split(".....");
    const metaData = result[0].split("\n");
    const docLines = result[1].split("\n");
    const column1RowCount = metaData.length;
    const firstColumnWidth = "25%";

    return (
      <Box sx={{ margin: "12px 0", boxShadow: "3px 2px 2px #dddddd" }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            backgroundColor: "#f8f4fd",
          }}
        >
          <Table
            sx={{ minWidth: 400, tableLayout: "fixed" }}
            aria-label="custom table with merged cell"
          >
            <TableBody>
              {metaData.map((row, index) => (
                <TableRow key={row.id}>
                  {/* First Column Cells */}
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "4px 9px",
                      width: firstColumnWidth,
                      wordBreak: "break-word",
                    }}
                  >
                    {row}
                  </TableCell>

                  {/* Second Column ONE BIG CELL */}
                  {index === 0 && (
                    <TableCell
                      rowSpan={column1RowCount}
                      sx={{
                        verticalAlign: "top",
                        borderLeft: "1px solid #ddd",
                      }}
                    >
                      {docLines.map((line) => (
                        <Typography sx={{ fontFamily: "serif" }}>
                          {line}
                        </Typography>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box className="scrollable-content" sx={{ paddingBottom: "100px" }}>
      <Typography variant="h6">Reference Documents</Typography>
      <Divider sx={{ margin: "15px 0" }} />
      {lookups.length === 0 ? (
        <Typography>No documents to show</Typography>
      ) : (
        lookups.map((lookup, lookupIndex) => (
          <Box key={`doc-${lookupIndex}`}>
            <Query queryText={lookup.Query} />
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
