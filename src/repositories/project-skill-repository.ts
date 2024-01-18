import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getByFilters = async (where: Prisma.project_skillsWhereInput) => {
  return await prisma.project_skills.findFirst({
    where,
  })
}

export const getAllByFilters = async (where: Prisma.project_skillsWhereInput) => {
  return await prisma.project_skills.findMany({
    where,
  })
}

export const getAllByProjectId = async (project_id: number) => {
  return await prisma.project_skills.findMany({
    select: {
      id: true,
      sequence_no: true,
      skills: {
        select: {
          id: true,
          skill_category_id: true,
          name: true,
          skill_categories: true,
        },
      },
    },
    where: {
      project_id,
    },
  })
}

export const getAllBySkillName = async (name: string) => {
  return await prisma.project_skills.findMany({
    where: {
      skills: {
        name: {
          contains: name,
        },
      },
    },
  })
}

export const createMany = async (data: Prisma.project_skillsCreateManyInput[]) => {
  return await prisma.project_skills.createMany({
    data,
    skipDuplicates: true,
  })
}

export const updateById = async (id: number, data: Prisma.project_skillsUpdateInput) => {
  return await prisma.project_skills.update({
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
  await prisma.project_skills.delete({
    where: {
      id,
    },
  })
}
