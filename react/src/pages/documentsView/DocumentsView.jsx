import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { createAuthenticationParams } from "../../authentication/authentication";
import { useTopic } from "../../contexts/TopicContext";
import {
  Box,
  Paper,
  Button,
  Container,
  Typography,
  Chip,
  Divider,
} from "@mui/material/";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
          Query: <i>{text}</i>
        </Typography>
      </Box>
    );
  };

  const Fragment = ({ text }) => {
    let frag = text;
    return (
      <>
        <Typography>
          Reference fragment: <i>{frag}</i>
        </Typography>
      </>
    );
  };

  const Document = ({ text }) => {
    let metaData;
    let docLines;
    let column1RowCount;
    const firstColumnWidth = "20%";
    if (text.includes(".....")) {
      let result = text.split(".....");
      metaData = result[0].split("\n");
      docLines = result[1].split("\n");
      column1RowCount = metaData.length;
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
      <Box sx={{ margin: "16px 0" }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #ddd" }}
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
                      padding: "6px 9px",
                      width: firstColumnWidth,
                      wordBreak: "break-word",
                    }}
                  >
                    {row}
                  </TableCell>

                  {/* Second Column Cell (only rendered in the first row) */}
                  {index === 0 && (
                    <TableCell
                      rowSpan={column1RowCount}
                      sx={{
                        verticalAlign: "top", // Align content to the top of the spanned cell
                        borderLeft: "1px solid #ddd", // Visual separator
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
