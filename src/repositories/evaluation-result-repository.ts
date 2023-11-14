import prisma from "../utils/prisma"

export const getAllByEvaluationAdministrationId = async (
  evaluation_administration_id: number
) => {
  return await prisma.evaluation_results.findMany({
    where: {
      evaluation_administration_id,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  await prisma.evaluation_results.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}
