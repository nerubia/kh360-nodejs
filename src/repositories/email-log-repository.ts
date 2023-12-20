import { type EmailLog } from "../types/email-log-type"
import prisma from "../utils/prisma"

export const create = async (data: EmailLog) => {
  return await prisma.email_logs.create({
    data,
  })
}

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
