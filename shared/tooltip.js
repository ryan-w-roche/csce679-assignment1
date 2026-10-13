import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// == Tooltip ==
export function setupTooltip(cells, getMode = () => null) {
  const tip = d3.select("#tooltip");

  cells
    .on("mouseover", (event, d) => {
      // The matching mode is shown in bold
      const mode = getMode();
      const date = `${d.year}-${String(d.month + 1).padStart(2, "0")}`;
      const maxText = mode === "max" ? `<b>max: ${d.max}</b>` : `max: ${d.max}`;
      const minText = mode === "min" ? `<b>min: ${d.min}</b>` : `min: ${d.min}`;
      tip.style("opacity", 1).html(`Date: ${date}; ${maxText} ${minText} C`);
    })
    .on("mousemove", (event) => {
      tip
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", () => tip.style("opacity", 0));
}
