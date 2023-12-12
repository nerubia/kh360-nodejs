import prisma from "../utils/prisma"

export const getByUserId = async (user_id: number) => {
  return await prisma.user_settings.findFirst({
    where: {
      user_id,
    },
  })
}
