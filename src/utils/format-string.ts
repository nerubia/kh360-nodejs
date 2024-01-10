export const convertToSlug = (str: string) => {
  str = str.replace(/[^\w\s]/gi, "")
  str = str.replace(/\s+/g, "-")
  str = str.toLowerCase()
  return str
}
