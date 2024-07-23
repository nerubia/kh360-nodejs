export const convertOldAnswer = (value: string) => {
  if (value === "Beginner") {
    return "2"
  }
  if (value === "Intermediate") {
    return "5"
  }
  if (value === "Expert") {
    return "8"
  }
  return null
}
