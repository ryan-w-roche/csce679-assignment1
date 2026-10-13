import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { DATA_PATH, loadData, aggregateMonthly } from "../shared/data.js";
import {
  drawHeatmap,
  drawLegend,
  getMode,
  setupToggle,
  updateColors,
} from "../shared/heatmap.js";
import { setupTooltip } from "../shared/tooltip.js";

main();

// == Main ==
async function main() {
  try {
    const daily = await loadData();
    const monthly = aggregateMonthly(daily);
    const { svg, cells, chartWidth } = drawHeatmap(monthly);
    drawLegend(svg, chartWidth);
    setupTooltip(cells, getMode);
    setupToggle(cells);
    updateColors(cells);
  } catch (err) {
    d3.select("#heatmap")
      .append("p")
      .attr("class", "error")
      .text(`Could not load ${DATA_PATH}.`);
    console.error(err);
  }
}
