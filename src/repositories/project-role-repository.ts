import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.project_roles.findUnique({
    select: {
      id: true,
      name: true,
      short_name: true,
    },
    where: {
      id,
    },
  })
}
