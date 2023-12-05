import prisma from "../utils/prisma"

export const getAllByEmailType = async (email_type: string) => {
  return await prisma.email_recipients.findMany({
    where: {
      email_type,
    },
  })
}
