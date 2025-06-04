import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FragmentAccordion({ fragment, docs }) {
  const [frag, setFrag] = useState("");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    setFrag(fragment);
    setDocuments(docs);
  }, [fragment]);

  const Document = ({ text }) => {
    if (!text.includes(".....")) {
      return (
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "white",
            margin: "15px 0",
            display: "flex",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #ddd",
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
    <Box sx={{ marginBottom: "5px" }}>
      <Accordion sx={{ backgroundColor: "secondary.main" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ marginLeft: "15px" }} />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Box>
            <Typography>
              <b>Reference fragment: </b>
            </Typography>
            <Typography sx={{ fontFamily: "serif" }}>{frag}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {documents?.length > 0 ? (
            documents.map((text) => <Document text={text} />)
          ) : (
            <Document text={"No results found for this fragment."} />
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default FragmentAccordion;
