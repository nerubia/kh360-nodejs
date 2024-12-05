import { type EmailLog } from "../types/email-log-type"
import { type Prisma } from "@prisma/client"
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

export const getByEmailAndType = async (email_address: string, email_type: string) => {
  return await prisma.email_logs.findMany({
    select: {
      id: true,
      sent_at: true,
    },
    where: {
      email_address,
      email_type,
    },
    orderBy: {
      id: "desc",
    },
  })
}

export const getAllByFilters = async (where: Prisma.email_logsWhereInput) => {
  return await prisma.email_logs.findMany({
    where,
  })
}

export const getByMailId = async (mail_id: string) => {
  return await prisma.email_logs.findFirst({
    where: {
      mail_id,
    },
  })
}
