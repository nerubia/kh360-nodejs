import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"
import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: Prisma.skill_map_ratingsUncheckedCreateInput[]) => {
  return await prisma.skill_map_ratings.createMany({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.skill_map_ratings.findUnique({
    where: {
      id,
    },
  })
}

export const getByFilters = async (where: Prisma.skill_map_ratingsWhereInput) => {
  return await prisma.skill_map_ratings.findFirst({
    where,
  })
}

export const updateByid = async (
  id: number,
  data: Prisma.skill_map_ratingsUncheckedUpdateInput
) => {
  return await prisma.skill_map_ratings.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
  })
}

export const deleteManyByIds = async (ids: number[]) => {
  return await prisma.skill_map_ratings.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })
}

export const deleteById = async (id: number) => {
  return await prisma.skill_map_ratings.delete({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.skill_map_ratingsWhereInput) => {
  return await prisma.skill_map_ratings.findMany({
    select: {
      id: true,
      skill_map_administration_id: true,
      skill_id: true,
      skills: true,
      skill_categories: true,
      skill_category_id: true,
      answer_option_id: true,
    },
    where,
  })
}

export const getAllDistinctByFilters = async (
  where: Prisma.skill_map_ratingsWhereInput,
  distinct: Prisma.Skill_map_ratingsScalarFieldEnum[]
) => {
  return await prisma.skill_map_ratings.findMany({
    where,
    select: {
      id: true,
      skill_map_administration_id: true,
      skill_id: true,
      skill_category_id: true,
    },
    orderBy: {
      skills: {
        sequence_no: "asc",
      },
    },
    distinct,
  })
}

export const updateStatusByAdministrationId = async (
  skill_map_administration_id: number,
  status: string
) => {
  await prisma.skill_map_ratings.updateMany({
    where: {
      skill_map_administration_id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const updateById = async (id: number, data: Prisma.skill_map_ratingsUpdateInput) => {
  await prisma.skill_map_ratings.update({
    where: {
      id,
    },
    data,
  })
}

export const countByFilters = async (where: Prisma.skill_map_ratingsWhereInput) => {
  return await prisma.skill_map_ratings.count({
    where,
  })
}

export const getRecentRating = async (
  userId: number,
  skillId: number,
  end_period: Date,
  submitted_date: Date
) => {
  return await prisma.skill_map_ratings.findMany({
    where: {
      skill_id: skillId,
      status: SkillMapRatingStatus.Submitted,
      skill_map_results: {
        user_id: userId,
        submitted_date: {
          lt: submitted_date,
        },
        skill_map_administrations: {
          skill_map_period_end_date: {
            lt: end_period,
          },
        },
      },
    },
    orderBy: [
      {
        skill_map_results: {
          submitted_date: "desc",
        },
      },
      {
        skill_map_results: {
          skill_map_administrations: {
            skill_map_period_end_date: "desc",
          },
        },
      },
    ],
    take: 1,
  })
}

export const getAllRecentRating = async (userId: number, period_end_date: Date) => {
  return await prisma.skill_map_ratings.findMany({
    select: {
      id: true,
      skill_map_administration_id: true,
      skill_id: true,
      skills: true,
      skill_categories: true,
      skill_category_id: true,
      answer_option_id: true,
      created_at: true,
    },
    where: {
      status: SkillMapRatingStatus.Submitted,
      skill_map_results: {
        user_id: userId,
        skill_map_administrations: {
          status: {
            notIn: [SkillMapAdministrationStatus.Cancelled],
          },
          skill_map_period_end_date: {
            lt: period_end_date,
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    distinct: ["skill_id"],
  })
}

export const getSkillsByPeriodEndDate = async (
  userId: number,
  submitted_date: Date | null,
  endPeriod: Date
) => {
  return await prisma.skill_map_ratings.findMany({
    select: {
      id: true,
      skill_map_administration_id: true,
      skill_id: true,
      skills: true,
      skill_categories: true,
      skill_category_id: true,
      answer_option_id: true,
    },
    where: {
      status: SkillMapRatingStatus.Submitted,
      skill_map_results: {
        user_id: userId,
        ...(submitted_date != null ? { submitted_date } : {}),
        skill_map_administrations: {
          skill_map_period_end_date: {
            lte: endPeriod,
          },
        },
      },
    },
    distinct: ["skill_id"],
  })
}
