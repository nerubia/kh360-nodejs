import prisma from "../utils/prisma"

export const getByName = async (name: string) => {
  return await prisma.system_settings.findFirst({
    where: {
      name,
    },
  })
}
