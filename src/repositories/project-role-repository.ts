import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.project_roles.findUnique({
    select: {
      id: true,
      name: true,
      short_name: true,
    },
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.project_rolesWhereInput) => {
  return await prisma.project_roles.findMany({
    select: {
      id: true,
      name: true,
      short_name: true,
      is_evaluee: true,
      for_project: true,
    },
    where,
  })
}
