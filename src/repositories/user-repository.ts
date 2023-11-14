import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.users.findUnique({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
    },
    where: {
      id,
    },
  })
}
