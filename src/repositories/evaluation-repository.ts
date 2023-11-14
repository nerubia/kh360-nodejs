import prisma from "../utils/prisma"

export const getAllByAdministrationId = async (
  evaluation_administration_id: number
) => {
  return await prisma.evaluations.findMany({
    where: {
      evaluation_administration_id,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  await prisma.evaluations.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}
