export const CHART_COLORS = [
  '#0052ff',
  '#4ade80',
  '#f87171',
  '#facc15',
  '#a78bfa',
  '#22d3ee',
  '#fb923c',
  '#34d399',
  '#f472b6',
  '#60a5fa',
  '#e879f9',
  '#94a3b8',
] as const;

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
