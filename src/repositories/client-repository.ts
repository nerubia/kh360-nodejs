import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.clients.findUnique({
    select: {
      name: true,
    },
    where: {
      id,
    },
  })
}

export const getAllByName = async (name: string) => {
  return await prisma.clients.findMany({
    where: {
      name: {
        contains: name,
      },
    },
  })
}
