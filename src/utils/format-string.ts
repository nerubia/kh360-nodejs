export const convertToSlug = (str: string) => {
  str = str.substring(0, 80)
  str = str.replace(/[^\w\s]/gi, "")
  str = str.replace(/\s+/g, "-")
  str = str.toLowerCase()
  return str
}
