import prisma from "../utils/prisma"

export const getAllByEvaluationAdministrationId = async (evaluation_administration_id: number) => {
  return await prisma.evaluation_results.findMany({
    where: {
      evaluation_administration_id,
    },
  })
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await prisma.evaluation_results.updateMany({
    where: {
      evaluation_administration_id,
    },
    data: {
      status,
    },
  })
}
