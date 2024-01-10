import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const countByFilters = async (where: Prisma.contractsWhereInput) => {
  return await prisma.contracts.count({
    where,
  })
}
