const getColorByScore = (score: number): string => {
  if (score >= 90) return '#22c55e' // Green
  if (score >= 80) return '#84cc16' // Light green 
  if (score >= 70) return '#eab308' // Yellow
  if (score >= 60) return '#f97316' // Orange
  return '#ef4444' // Red
}

export default getColorByScore;
