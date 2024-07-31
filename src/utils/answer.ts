export const convertOldAnswer = (value: string | number): string | null => {
  if (typeof value === "number") {
    return value.toString()
  }

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

  if (!isNaN(Number(trimmedValue))) {
    return trimmedValue
  }

  return null
}
