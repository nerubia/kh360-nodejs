import prisma from "../utils/prisma"

export const getAllByName = async (name: string) => {
  return await prisma.user_roles.findMany({
    select: {
      user_id: true,
    },
    where: {
      name,
    },
  })
}
