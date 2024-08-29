import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const countAllByFilters = async (where: Prisma.invoice_detailsWhereInput) => {
  const count = await prisma.invoice_details.count({
    where,
  })
  return count
}
