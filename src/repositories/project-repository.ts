import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type Project } from "../types/project-type"
import { convertToSlug } from "../utils/format-string"

export const getById = async (id: number) => {
  return await prisma.projects.findUnique({
    select: {
      id: true,
      name: true,
      description: true,
      start_date: true,
      end_date: true,
      status: true,
      client_id: true,
    },
    where: {
      id,
    },
  })
}

export const getByName = async (name: string) => {
  return await prisma.projects.findFirst({
    where: {
      name,
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
    orderBy: [
      {
        name: "asc",
      },
    ],
  })
}

export const create = async (data: Project) => {
  const currentDate = new Date()
  return await prisma.projects.create({
    data: {
      ...data,
      slug: convertToSlug(data.name as string),
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const updateById = async (id: number, data: Project) => {
  const currentDate = new Date()
  return await prisma.projects.update({
    where: {
      id,
    },
    data: {
      ...data,
      slug: convertToSlug(data.name as string),
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const create = async (data: Project) => {
  const currentDate = new Date()
  return await prisma.projects.create({
    data: {
      ...data,
      slug: convertToSlug(data.name as string),
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const updateById = async (id: number, data: Project) => {
  const currentDate = new Date()
  return await prisma.projects.update({
    where: {
      id,
    },
    data: {
      ...data,
      slug: convertToSlug(data.name as string),
      created_at: currentDate,
      updated_at: currentDate,
    },
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