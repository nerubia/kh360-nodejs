import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"
import {
  type SkillMapAdministration,
  SkillMapAdministrationStatus,
} from "../types/skill-map-administration-type"

export const getById = async (id: number) => {
  return await prisma.skill_map_administrations.findUnique({
    where: {
      id,
    },
  })
}

export const getPreviousSkillMapAdmin = async (endDate: Date) => {
  return await prisma.skill_map_administrations.findFirst({
    where: {
      skill_map_period_end_date: { lt: endDate },
      status: SkillMapAdministrationStatus.Closed,
    },
    orderBy: {
      skill_map_period_end_date: "desc",
    },
  })
}

export const getPreviousSkillMapAdminOngoing = async (endDate: Date) => {
  return await prisma.skill_map_administrations.findFirst({
    where: {
      skill_map_period_end_date: { lt: endDate },
      status: SkillMapAdministrationStatus.Ongoing,
    },
    orderBy: {
      skill_map_period_end_date: "desc",
    },
  })
}

export const getAllByFilters = async (where: Prisma.skill_map_administrationsWhereInput) => {
  return await prisma.skill_map_administrations.findMany({
    where,
  })
}

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await prisma.skill_map_administrations.findMany({
    where: {
      status,
      skill_map_schedule_start_date: {
        lte: date,
      },
      skill_map_schedule_end_date: {
        gte: date,
      },
    },
  })
}

export const getAllByStatusAndEndDate = async (status: string, date: Date) => {
  return await prisma.skill_map_administrations.findMany({
    where: {
      status,
      skill_map_schedule_end_date: {
        lt: date,
      },
    },
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.skill_map_administrationsWhereInput
) => {
  return await prisma.skill_map_administrations.findMany({
    skip,
    take,
    where,
    orderBy: {
      id: "desc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.skill_map_administrationsWhereInput) => {
  const count = await prisma.skill_map_administrations.count({
    where,
  })

  return count
}

export const create = async (data: SkillMapAdministration) => {
  return await prisma.skill_map_administrations.create({
    data: {
      ...data,
      created_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      skill_map_schedule_start_date: true,
      skill_map_schedule_end_date: true,
      skill_map_period_start_date: true,
      skill_map_period_end_date: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}
export const updateById = async (id: number, data: SkillMapAdministration) => {
  return await prisma.skill_map_administrations.update({
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
      skill_map_schedule_start_date: true,
      skill_map_schedule_end_date: true,
      skill_map_period_start_date: true,
      skill_map_period_end_date: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}

export const deleteById = async (id: number) => {
  return await prisma.skill_map_administrations.delete({
    where: {
      id,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.skill_map_administrations.update({
    where: {
      id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}
