import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.invoice_emailsUncheckedCreateInput) => {
  return await prisma.invoice_emails.create({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.invoice_emailsUncheckedUpdateInput) => {
  return await prisma.invoice_emails.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.invoice_emails.delete({
    where: {
      id,
    },
  })
}
