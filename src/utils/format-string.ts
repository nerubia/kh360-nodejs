export const convertToSlug = (str: string) => {
  str = str.substring(0, 80)
  str = str.replace(/[^\w\s]/gi, "")
  str = str.replace(/\s+/g, "-")
  str = str.toLowerCase()
  return str
}

export const removeWhitespace = (str: string) => {
  const trimmedString = str.trim()
  const compactString = trimmedString.replace(/\s+/g, " ")
  return compactString
}
