import React, { useState, useEffect } from "react";
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
    const firstColumnWidth = "20%";

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
      {lookups.map((lookup) =>
        Object.entries(lookup).map(([query, fragment]) => (
          <Box key={query}>
            <Query queryText={query} />
            {Object.values(fragment).map((docs) => (
              <FragmentAccordion document={docs} />
            ))}
          </Box>
        ))
      )}
    </Box>
  );
}

export default DocumentsView;
