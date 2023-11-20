import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.evaluation_templates.findUnique({
    where: {
      id,
    },
  })
}
