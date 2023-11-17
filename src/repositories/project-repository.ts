import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.projects.findUnique({
    select: {
      id: true,
      name: true,
    },
    where: {
      id,
    },
  })
}
