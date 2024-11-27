import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.payment_emailsUncheckedCreateInput) => {
  return await prisma.payment_emails.create({
    data,
  })
}

export const updateById = async (id: number, data: Prisma.payment_emailsUncheckedUpdateInput) => {
  return await prisma.payment_emails.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.payment_emails.delete({
    where: {
      id,
    },
  })
}
