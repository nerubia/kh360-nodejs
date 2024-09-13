import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: Prisma.invoice_attachmentsCreateInput[]) => {
  return await prisma.invoice_attachments.createMany({
    data,
  })
}
