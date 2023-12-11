import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.project_members.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.project_membersWhereInput) => {
  return await prisma.project_members.findMany({
    where,
  })
}

export const countByFilters = async (where: Prisma.project_membersWhereInput) => {
  return await prisma.project_members.count({
    where,
  })
}
