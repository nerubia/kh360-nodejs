import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (where: Prisma.skill_categoriesWhereInput) => {
  return await prisma.skill_categories.findMany({
    where,
  })
}
