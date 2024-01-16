import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getByFilters = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.findFirst({
    where,
  })
}

export const getAllByFilters = async (
  skip: number,
  take: number,
  where: Prisma.skillsWhereInput
) => {
  return await prisma.skills.findMany({
    select: {
      id: true,
      name: true,
      skill_category_id: true,
      sequence_no: true,
      skill_categories: true,
    },
    skip,
    take,
    where,
  })
}

export const countByFilters = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.count({
    where,
  })
}
