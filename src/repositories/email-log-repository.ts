import prisma from "../utils/prisma"

export const getAllByEmail = async (email_address: string) => {
  return await prisma.email_logs.findMany({
    select: {
      id: true,
      sent_at: true,
    },
    where: {
      email_address,
    },
    orderBy: {
      id: "desc",
    },
  })
}
