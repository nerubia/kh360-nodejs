import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.companies.findUnique({
    where: {
      id,
    },
  })
}
