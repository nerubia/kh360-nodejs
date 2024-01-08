import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.evaluation_template_contents.findUnique({
    where: {
      id,
    },
  })
}

export const getByEvaluationTemplateId = async (evaluation_template_id: number) => {
  return await prisma.evaluation_template_contents.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      rate: true,
      is_active: true,
      deleted_at: true,
    },
    where: {
      evaluation_template_id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_template_contentsWhereInput) => {
  return await prisma.evaluation_template_contents.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      deleted_at: true,
    },
    where,
  })
}

export const countAllByFilters = async (where: Prisma.evaluation_template_contentsWhereInput) => {
  return await prisma.evaluation_template_contents.count({
    where,
  })
}

export const updateById = async (
  id: number,
  data: Prisma.evaluation_template_contentsUpdateInput
) => {
  return await prisma.evaluation_template_contents.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export const softDeleteById = async (id: number) => {
  await prisma.evaluation_template_contents.updateMany({
    where: {
      id,
    },
    data: {
      deleted_at: new Date(),
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.evaluation_template_contents.deleteMany({
    where: {
      id,
    },
  })
}

export const deleteByEvaluationTemplateId = async (evaluation_template_id: number) => {
  await prisma.evaluation_template_contents.deleteMany({
    where: {
      evaluation_template_id,
    },
  })
}

export const softDeleteByEvaluationTemplateId = async (evaluation_template_id: number) => {
  await prisma.evaluation_template_contents.updateMany({
    where: {
      evaluation_template_id,
    },
    data: {
      deleted_at: new Date(),
    },
  })
}
