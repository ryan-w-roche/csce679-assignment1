import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { DATA_PATH, loadData, aggregateMonthly } from "../shared/data.js";
import {
  margin,
  drawHeatmap,
  drawLegend,
  getMode,
  setupToggle,
  updateColors,
} from "../shared/heatmap.js";
import { setupTooltip } from "../shared/tooltip.js";

const MAX_COLOR = "#0ba103";
const MIN_COLOR = "#000ed7";

main();

// == Main ==
async function main() {
  try {
    const daily = await loadData();

    // Keep last 10 years
    const latestYear = d3.max(daily, (d) => d.date.getFullYear());
    const recentDaily = d3.filter(
      daily,
      (d) => d.date.getFullYear() > latestYear - 10,
    );

    const monthly = aggregateMonthly(recentDaily);
    const { svg, g, cells, x, y, chartWidth } = drawHeatmap(monthly, 80, 60);

    drawMiniLines(recentDaily, monthly, g, x, y);
    drawLegend(svg, chartWidth);
    drawLineLegend(svg, chartWidth);
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

function drawMiniLines(recentDaily, monthly, g, x, y) {
  // Position in a cell
  const dayX = d3
    .scaleLinear()
    .domain([1, 31])
    .range([4, x.bandwidth() - 4]);
  const tempY = d3
    .scaleLinear()
    .domain([
      d3.min(recentDaily, (d) => d.min),
      d3.max(recentDaily, (d) => d.max),
    ])
    .range([y.bandwidth() - 4, 4]);

  // == Draw the lines ==
  const maxLine = d3
    .line()
    .x((d) => dayX(d.date.getDate()))
    .y((d) => tempY(d.max));
  const minLine = d3
    .line()
    .x((d) => dayX(d.date.getDate()))
    .y((d) => tempY(d.min));

  // One group per year/month, moved onto its cell so the lines can be drawn
  const minis = g
    .selectAll("g.mini")
    .data(monthly)
    .join("g")
    .attr("class", "mini")
    .attr("transform", (d) => `translate(${x(d.year)}, ${y(d.month)})`)
    .attr("pointer-events", "none"); // let hover/click reach the cell underneath

  // Daily max line
  minis
    .append("path")
    .attr("d", (d) => maxLine(d.days))
    .attr("fill", "none")
    .attr("stroke", MAX_COLOR)
    .attr("stroke-width", 1.5);
  // Daily min line
  minis
    .append("path")
    .attr("d", (d) => minLine(d.days))
    .attr("fill", "none")
    .attr("stroke", MIN_COLOR)
    .attr("stroke-width", 1.5);
}

function drawLineLegend(svg, chartWidth) {
  const entries = [
    { label: "Daily max", color: MAX_COLOR },
    { label: "Daily min", color: MIN_COLOR },
  ];

  // Same x as the color legend; y is below its 300px bar plus a 40px gap
  const lx = margin.left + chartWidth + 25;
  const ly = margin.top + 300 + 40;

  const legend = svg.append("g").attr("transform", `translate(${lx},${ly})`);

  // One <g> per entry, stacked 20px apart
  const rows = legend
    .selectAll("g")
    .data(entries)
    .join("g")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  rows
    .append("line")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("stroke", (d) => d.color)
    .attr("stroke-width", 2);

  rows
    .append("text")
    .attr("x", 26)
    .attr("dy", "0.35em") // centers the text vertically on the line
    .attr("font-size", 12)
    .text((d) => d.label);
}
