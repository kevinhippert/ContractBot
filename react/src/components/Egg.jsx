import React from "react";

function Egg({ line }) {
  return line.toLowerCase().includes("easter egg") && Math.random() < 0.1 ? (
    <img
      alt="Software is mysterious!"
      src="/Ideas-are-illusions.jpg"
      style={{ height: "14em", paddingLeft: "2em" }}
    />
  ) : null;
}

export default Egg;
