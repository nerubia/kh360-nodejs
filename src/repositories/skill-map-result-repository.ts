import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const create = async (data: Prisma.skill_map_resultsUncheckedCreateInput) => {
  return await prisma.skill_map_results.create({
    data,
  })
}

export const createMany = async (data: Prisma.skill_map_resultsUncheckedCreateInput[]) => {
  return await prisma.skill_map_results.createMany({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.skill_map_results.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  return await prisma.skill_map_results.findMany({
    select: {
      id: true,
      user_id: true,
      status: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      skill_map_administration_id: true,
      skill_map_ratings: true,
    },
    where,
  })
}

export const getByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  return await prisma.skill_map_results.findFirst({
    where,
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.skill_map_results.update({
    where: {
      id,
    },
    data: {
      status,
      submitted_date: new Date(),
      updated_at: new Date(),
    },
  })
}

export const addComment = async (id: number, comment: string) => {
  return await prisma.skill_map_results.update({
    where: {
      id,
    },
    data: {
      comments: comment,
    },
  })
}

export const updateById = async (id: number, data: Prisma.skill_map_resultsUpdateInput) => {
  await prisma.skill_map_results.update({
    where: {
      id,
    },
    data,
  })
}

export const updateStatusByAdministrationId = async (
  skill_map_administration_id: number,
  status: string
) => {
  await prisma.skill_map_results.updateMany({
    where: {
      skill_map_administration_id,
    },
    data: {
      status,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.skill_map_results.delete({
    where: {
      id,
    },
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.skill_map_resultsWhereInput
) => {
  return await prisma.skill_map_results.findMany({
    skip,
    take,
    select: {
      id: true,
      skill_map_administration_id: true,
      status: true,
      users: {
        select: {
          id: true,
          slug: true,
          first_name: true,
          last_name: true,
          picture: true,
        },
      },
    },
    where,
    orderBy: {
      id: "desc",
    },
  })
}

export const getLatestSkillMapRating = async (
  skip: number,
  take: number,
  where: Prisma.skill_map_resultsWhereInput
) => {
  return await prisma.skill_map_results.findMany({
    skip,
    take,
    select: {
      id: true,
      skill_map_administration_id: true,
      status: true,
      submitted_date: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
    where,
    orderBy: {
      submitted_date: "desc",
    },
    distinct: ["user_id"],
  })
}

export const countAllByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  const count = await prisma.skill_map_results.count({
    where,
  })
  return count
}

// NOTE: count + distinct does not work in prisma
export const countAllByFiltersDistinctByUser = async (
  where: Prisma.skill_map_resultsWhereInput
) => {
  const skillMapResults = await prisma.skill_map_results.groupBy({
    by: ["user_id"],
    where,
  })
  return skillMapResults.length
}
