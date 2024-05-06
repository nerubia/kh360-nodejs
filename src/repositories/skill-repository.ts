import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { type SkillType } from "../types/skill-type"

export const getById = async (id: number) => {
  return await prisma.skills.findFirst({
    where: {
      id,
    },
    include: {
      skill_categories: true,
    },
  })
}

export const getByName = async (name: string) => {
  return await prisma.skills.findFirst({
    where: {
      name,
    },
  })
}

export const findSkillDesc = async () => {
  return await prisma.skills.findFirst({
    orderBy: { sequence_no: "desc" },
  })
}

export const create = async (data: SkillType, nextSequenceNo: number) => {
  const currentDate = new Date()
  return await prisma.skills.create({
    data: {
      ...data,
      sequence_no: nextSequenceNo,
      created_at: currentDate,
      updated_at: currentDate,
    },
    select: {
      id: true,
      name: true,
      skill_category_id: true,
      sequence_no: true,
      skill_categories: true,
      status: true,
      description: true,
    },
  })
}

export const updateById = async (id: number, data: Prisma.skillsUpdateInput) => {
  return await prisma.skills.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      skill_category_id: true,
      sequence_no: true,
      skill_categories: true,
      status: true,
      description: true,
    },
  })
}

export const getByFilters = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.findFirst({
    where,
  })
}

export const getAllSkills = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.findMany({
    where,
  })
}

export const getAllByFiltersWithPaging = async (
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
      status: true,
      description: true,
    },
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

export const getAllByFilters = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.findMany({
    select: {
      id: true,
      name: true,
      skill_category_id: true,
      sequence_no: true,
      skill_categories: true,
      status: true,
      description: true,
    },
    where,
    orderBy: [
      {
        sequence_no: "asc",
      },
    ],
  })
}

export const countByFilters = async (where: Prisma.skillsWhereInput) => {
  return await prisma.skills.count({
    where,
  })
}

export const deleteById = async (id: number, skill_id: number) => {
  await prisma.skills.delete({
    where: {
      id: skill_id,
    },
  })
}
