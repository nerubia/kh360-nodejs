import { format, utcToZonedTime } from "date-fns-tz"

export const formatDate = (date?: string) => {
  return date?.split("T")[0]
}

export const formatDateRange = (startDate: Date, endDate: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }
  const monthAndDateOnly: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }

  if (startDate === undefined || endDate === undefined || startDate === null || endDate === null) {
    return ""
  }

  let formattedDate = startDate.toLocaleDateString("en-US", monthAndDateOnly)

  if (
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCFullYear() === endDate.getUTCFullYear()
  ) {
    formattedDate += ` - ${endDate.getUTCDate()}, ${endDate.getUTCFullYear()}`
  } else if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
    formattedDate += ` - ${endDate.toLocaleDateString("en-US", options)}`
  } else {
    formattedDate = `${startDate.toLocaleDateString(
      "en-US",
      options
    )} - ${endDate.toLocaleDateString("en-US", options)}`
  }

  return formattedDate
}

export const convertToFullDate = (date?: Date) => {
  const inputDate = new Date(date ?? "")
  const utcDate = utcToZonedTime(inputDate, "UTC")
  return format(utcDate, "MMMM d, yyyy", { timeZone: "UTC" })
}
