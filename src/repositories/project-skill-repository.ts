import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"

export const getAllByProjectId = async (project_id: number) => {
  return await prisma.project_skills.findMany({
    select: {
      id: true,
      skills: {
        select: {
          id: true,
          skill_category_id: true,
          name: true,
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
