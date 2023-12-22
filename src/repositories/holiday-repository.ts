import prisma from "../utils/prisma"

export const getHolidays = async (startDate: Date, endDate: Date) => {
  const holidays = await prisma.holidays.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })
  return holidays.map((holiday) => holiday.date)
}
