import prisma from "../utils/prisma"

export const getAllByStatus = async (status: string, date: Date) => {
  return await prisma.evaluation_administrations.findMany({
    where: {
      status,
      eval_schedule_start_date: {
        lte: date,
      },
      eval_schedule_end_date: {
        gte: date,
      },
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  await prisma.evaluation_administrations.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}
