import prisma from "../utils/prisma"

export const getTotalLeaveDuration = async (leaveIds: number[], startDate: Date, endDate: Date) => {
  return await prisma.leave_breakdowns.aggregate({
    _sum: {
      duration: true,
    },
    where: {
      leave_id: {
        in: leaveIds,
      },
      leave_date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })
}
