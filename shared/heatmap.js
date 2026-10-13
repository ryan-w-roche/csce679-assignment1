import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const margin = { top: 40, right: 120, bottom: 20, left: 90 };

// Color scale: 0 C = cool (blue/purple), 40 C = hot (dark red).
// 0–40 keeps max and min on the same color scale, so they are comparable.
export const color = d3
  .scaleSequential((t) => d3.interpolateSpectral(1 - t))
  .domain([0, 40]);

// State: which temperature is shown
let mode = "max";
export const getMode = () => mode;

// == Draw the grid ==
export function drawHeatmap(monthly, cellW = 44, cellH = 34) {
  const years = [...new Set(monthly.map((d) => d.year))].sort((a, b) => a - b);

  const chartWidth = years.length * cellW;
  const chartHeight = MONTHS.length * cellH;

  // Band scales split a range into equal slots, one per category
  const x = d3
    .scaleBand()
    .domain(years)
    .range([0, chartWidth])
    .padding(0.1);
  const y = d3
    .scaleBand()
    .domain(d3.range(12))
    .range([0, chartHeight])
    .padding(0.1);

  const svg = d3
    .select("#heatmap")
    .append("svg")
    .attr("width", margin.left + chartWidth + margin.right)
    .attr("height", margin.top + chartHeight + margin.bottom);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Year axis on top, month axis on the left
  g.append("g").call(d3.axisTop(x).tickSizeOuter(0));
  g.append("g").call(
    d3
      .axisLeft(y)
      .tickFormat((m) => MONTHS[m])
      .tickSizeOuter(0),
  );

  // One rectangle per year/month
  const cells = g
    .selectAll("rect.cell")
    .data(monthly)
    .join("rect")
    .attr("class", "cell")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.month))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 2);

  return { svg, g, cells, x, y, chartWidth };
}

// == Legend ==
export function drawLegend(svg, chartWidth) {
  const legendH = 300;
  const legendW = 16;
  const lx = margin.left + chartWidth + 25;
  const ly = margin.top;

  // A vertical gradient from 0 C (top) to 40 C (bottom)
  const gradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  d3.range(0, 1.01, 0.1).forEach((t) => {
    gradient
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", color(t * 40));
  });

  const legend = svg.append("g").attr("transform", `translate(${lx},${ly})`);

  legend
    .append("rect")
    .attr("width", legendW)
    .attr("height", legendH)
    .attr("fill", "url(#legend-gradient)");

  const scale = d3.scaleLinear().domain([0, 40]).range([0, legendH]);
  legend
    .append("g")
    .attr("transform", `translate(${legendW},0)`)
    .call(
      d3
        .axisRight(scale)
        .ticks(8)
        .tickFormat((d) => `${d} C`),
    );
}

// == Max/min switching ==
export function setupToggle(cells) {
  d3.select("#toggle").on("click", () => toggleMode(cells));
  cells.on("click", () => toggleMode(cells));
}

function toggleMode(cells) {
  mode = mode === "max" ? "min" : "max";
  d3.select("#toggle").text(
    mode === "max" ? "Showing: Maximum" : "Showing: Minimum",
  );
  d3.select("#tooltip").style("opacity", 0);
  updateColors(cells);
}

export function updateColors(cells) {
  cells
    .transition()
    .duration(400)
    .attr("fill", (d) => color(d[mode]));
}
