import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function FragmentAccordion({ document }) {
  const [frag, setFrag] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    console.log(frag);
    console.log(results);
  }, [frag, results]);

  useEffect(() => {
    if (document) {
      setFrag(Object.keys(document));
      setResults(document[frag]);
    }
  }, [document]);

  return (
    <Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span">{frag}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {results &&
            results.map((result) => <Typography>{result}</Typography>)}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default FragmentAccordion;
