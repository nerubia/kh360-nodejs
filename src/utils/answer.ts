export const convertOldAnswer = (value: string) => {
  const trimmedValue = value.trim()
  if (trimmedValue === "Beginner") {
    return "2"
  }
  if (trimmedValue === "Intermediate") {
    return "5"
  }
  if (trimmedValue === "Expert") {
    return "8"
  }
  return null
}
