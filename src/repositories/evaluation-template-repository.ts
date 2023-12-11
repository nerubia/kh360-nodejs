import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.evaluation_templates.findUnique({
    where: {
      id,
    },
  })
}

export const list = async (is_active: boolean) => {
  return await prisma.evaluation_templates.findMany({
    where: {
      is_active,
    },
  })
}
