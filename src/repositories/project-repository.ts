import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.projects.findUnique({
    select: {
      id: true,
      name: true,
      start_date: true,
      end_date: true,
      status: true,
    },
    where: {
      id,
    },
  })
}

export const getAllByName = async (name: string) => {
  return await prisma.projects.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      name: {
        contains: name,
      },
    },
  })
}

export const getAllByFilters = async (where: Prisma.projectsWhereInput) => {
  return await prisma.projects.findMany({
    select: {
      id: true,
      name: true,
    },
    where,
  })
}

export const getAllStatus = async () => {
  return await prisma.projects.findMany({
    select: {
      status: true,
    },
    distinct: ["status"],
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.projectsWhereInput
) => {
  return await prisma.projects.findMany({
    skip,
    take,
    where,
  })
}

export const countByFilters = async (where: Prisma.projectsWhereInput) => {
  return await prisma.projects.count({
    where,
  })
}

export const softDeleteById = async (id: number) => {
  await prisma.projects.updateMany({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.projects.deleteMany({
    where: {
      id,
    },
  })
}
