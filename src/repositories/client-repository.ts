import prisma from "../utils/prisma"

export const getAllByName = async (name: string) => {
  return await prisma.clients.findMany({
    where: {
      name: {
        contains: name,
      },
    },
  })
}
