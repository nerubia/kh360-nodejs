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

export const create = async (data: Prisma.project_membersCreateInput) => {
  const currentDate = new Date()
  return await prisma.project_members.create({
    data: {
      ...data,
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const update = async (id: number, data: Prisma.project_membersUpdateInput) => {
  return await prisma.project_members.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.project_members.deleteMany({
    where: {
      id,
    },
  })
}
