export const calculateNorms = async (scores: number[]) => {
  const scoresLength = scores.length
  const mean = scores.reduce((total, currentValue) => total + currentValue, 0) / scoresLength
  const sum = scores.reduce((total, currentValue) => total + Math.pow(currentValue - mean, 2), 0)
  const variance = sum / scoresLength
  const stdDev = Math.sqrt(variance)
  return { mean, stdDev }
}

export const getBanding = (score: number) => {
  if (score <= -2.0) {
    return "Very Low"
  }
  if (score > -2.0 && score <= -1.5) {
    return "Low"
  }
  if (score > -1.5 && score <= -0.5) {
    return "Moderate Low"
  }
  if (score > -0.5 && score < 0.5) {
    return "Average"
  }
  if (score >= 0.5 && score < 1.5) {
    return "Moderate High"
  }
  if (score >= 1.5 && score < 2.0) {
    return "High"
  }
  if (score >= 2.0) {
    return "Very High"
  }
  return "Unknown"
}
