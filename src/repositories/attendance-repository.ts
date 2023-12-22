import prisma from "../utils/prisma"

export const getAttendances = async (user_id: number, startDate: Date, endDate: Date) => {
  return await prisma.attendances.groupBy({
    by: ["att_type"],
    _count: {
      att_type: true,
    },
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      user_id,
    },
  })
}

export const getLates = async (
  user_id: number,
  startDate: Date,
  endDate: Date,
  late_flag: string
) => {
  return await prisma.attendances.count({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      user_id,
      late_flag,
    },
  })
}
