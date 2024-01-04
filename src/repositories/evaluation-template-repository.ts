import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.evaluation_templates.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_templatesWhereInput) => {
  return await prisma.evaluation_templates.findMany({
    where,
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.evaluation_templatesWhereInput
) => {
  return await prisma.evaluation_templates.findMany({
    skip,
    take,
    where,
  })
}

export const list = async (is_active: boolean) => {
  return await prisma.evaluation_templates.findMany({
    where: {
      is_active,
    },
  })
}

export const create = async (data: Prisma.evaluation_templatesCreateInput) => {
  const currentDate = new Date()
  return await prisma.evaluation_templates.create({
    data: {
      ...data,
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const updateById = async (id: number, data: Prisma.evaluation_templatesUpdateInput) => {
  return await prisma.evaluation_templates.update({
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
  await prisma.evaluation_templates.deleteMany({
    where: {
      id,
    },
  })
}

export const softDeleteById = async (id: number) => {
  await prisma.evaluation_templates.update({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
    },
  })
}

export const countByFilters = async (where: Prisma.evaluation_templatesWhereInput) => {
  return await prisma.evaluation_templates.count({
    where,
  })
}
