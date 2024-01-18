import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.project_member_skills.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.project_member_skillsWhereInput) => {
  return await prisma.project_member_skills.findMany({
    select: {
      id: true,
      skills: true,
    },
    where,
  })
}
