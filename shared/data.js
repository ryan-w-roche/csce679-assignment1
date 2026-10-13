import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export const DATA_PATH = "../data/temperature_daily.csv";

// == Load and parse ==
export async function loadData() {
  const parseDate = d3.timeParse("%Y-%m-%d");
  const rows = await d3.csv(DATA_PATH, (d) => ({
    date: parseDate(d.date),
    max: +d.max_temperature,
    min: +d.min_temperature,
  }));

  // Drop any broken rows
  return rows.filter((d) => d.date && !isNaN(d.max) && !isNaN(d.min));
}

// == Group daily rows into year/month cells ==
export function aggregateMonthly(daily) {
  const grouped = d3.rollups(
    daily,
    (days) => ({
      max: d3.max(days, (d) => d.max), // hottest daily max in the month
      min: d3.min(days, (d) => d.min), // coldest daily min in the month
      days, // the daily rows themselves
    }),
    (d) => d.date.getFullYear(),
    (d) => d.date.getMonth(), // 0 = January
  );

  const monthly = [];
  for (const [year, months] of grouped) {
    for (const [month, v] of months) {
      monthly.push({ year, month, max: v.max, min: v.min, days: v.days });
    }
  }
  return monthly;
}
