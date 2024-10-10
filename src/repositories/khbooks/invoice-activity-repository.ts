import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.invoice_activitiesUncheckedCreateInput) => {
  return await prisma.invoice_activities.create({
    data,
  })
}
