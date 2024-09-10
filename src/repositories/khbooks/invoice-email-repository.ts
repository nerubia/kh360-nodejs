import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.invoice_emailsUncheckedCreateInput) => {
  return await prisma.invoice_emails.create({
    data,
  })
}
