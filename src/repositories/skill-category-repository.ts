import { type SkillCategory } from "../types/skill-category-type"
import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (
  where: Prisma.skill_categoriesWhereInput,
  include?: Prisma.skill_categoriesInclude
) => {
  return await prisma.skill_categories.findMany({
    include,
    where,
    orderBy: {
      sequence_no: "asc",
    },
  })
}

export const getAllByFiltersWithPaging = async (
  where: Prisma.skill_categoriesWhereInput,
  currentPage: number,
  itemsPerPage: number
) => {
  return await prisma.skill_categories.findMany({
    where,
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
    orderBy: [
      {
        sequence_no: "asc",
      },
    ],
  })
}

export const countByFilters = async (where: Prisma.skill_categoriesWhereInput) => {
  return await prisma.skill_categories.count({
    where,
  })
}

export const getById = async (id: number) => {
  return await prisma.skill_categories.findUnique({
    where: {
      id,
    },
  })
}

export const getByName = async (name: string) => {
  return await prisma.skill_categories.findFirst({
    where: {
      name,
    },
  })
}

export const findSkillCategoryDesc = async () => {
  return await prisma.skill_categories.findFirst({
    orderBy: { sequence_no: "desc" },
  })
}

export const create = async (data: SkillCategory, nextSequenceNo: number) => {
  const currentDate = new Date()
  return await prisma.skill_categories.create({
    data: {
      ...data,
      sequence_no: nextSequenceNo,
      created_at: currentDate,
      updated_at: currentDate,
    },
  })
}

export const updateById = async (id: number, data: Prisma.skill_categoriesUpdateInput) => {
  return await prisma.skill_categories.update({
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
  await prisma.skill_categories.delete({
    where: {
      id,
    },
  })
}

export const show = async (id: number) => {
  return await prisma.skill_categories.findFirst({
    where: {
      id,
    },
  })
}

export const updateSequenceNo = async (id: number, sequence_no: number) => {
  return await prisma.skill_categories.update({
    where: {
      id,
    },
    data: {
      sequence_no,
      updated_at: new Date(),
    },
  })
}
