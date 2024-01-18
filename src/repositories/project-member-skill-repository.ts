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

export const getByFilters = async (where: Prisma.project_member_skillsWhereInput) => {
  return await prisma.project_member_skills.findFirst({
    select: {
      id: true,
      skills: true,
    },
    where,
  })
}

export const updateById = async (id: number, data: Prisma.project_member_skillsUpdateInput) => {
  return await prisma.project_member_skills.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export const createMany = async (data: Prisma.project_member_skillsCreateManyInput[]) => {
  return await prisma.project_member_skills.createMany({
    data,
    skipDuplicates: true,
  })
}

export const deleteById = async (id: number) => {
  await prisma.project_member_skills.delete({
    where: {
      id,
    },
  })
}