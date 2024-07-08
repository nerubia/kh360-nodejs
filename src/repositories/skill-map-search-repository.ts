import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"
import { SkillMapSearchSortOptions } from "../types/skill-map-search-type"

export const paginateByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  return await prisma.skill_map_results.findMany({
    where: {
      ...where,
      status: SkillMapResultStatus.Submitted,
    },
    include: {
      users: {
        select: {
          first_name: true,
        },
      },
      skill_map_administrations: true,
      skill_map_ratings: {
        where: {
          status: SkillMapRatingStatus.Submitted,
        },
        orderBy: {
          created_at: "desc",
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  })
}

export const getLatestSkillMapRating = async (
  skip: number,
  take: number,
  where: Prisma.skill_map_ratingsWhereInput,
  sortBy?: string
) => {
  let orderBy: Prisma.skill_map_ratingsOrderByWithRelationInput[] = [
    {
      skill_map_results: {
        submitted_date: "desc",
      },
    },
  ]

  if (sortBy === SkillMapSearchSortOptions.SKILL_RATING_DESC) {
    orderBy = [
      {
        skill_map_results: {
          submitted_date: "desc",
        },
      },
      {
        answer_options: {
          rate: "desc",
        },
      },
      {
        skills: {
          name: "desc",
        },
      },
      {
        skill_map_results: {
          users: {
            last_name: "desc",
          },
        },
      },
      {
        skill_map_results: {
          users: {
            first_name: "desc",
          },
        },
      },
    ]
  }

  if (sortBy === SkillMapSearchSortOptions.SKILL_RATING_ASC) {
    orderBy = [
      {
        skill_map_results: {
          submitted_date: "desc",
        },
      },
      {
        answer_options: {
          rate: "asc",
        },
      },
      {
        skills: {
          name: "asc",
        },
      },
      {
        skill_map_results: {
          users: {
            last_name: "asc",
          },
        },
      },
      {
        skill_map_results: {
          users: {
            first_name: "asc",
          },
        },
      },
    ]
  }

  if (sortBy === SkillMapSearchSortOptions.NAME) {
    orderBy = [
      {
        skill_map_results: {
          submitted_date: "desc",
        },
      },
      {
        skill_map_results: {
          users: {
            last_name: "asc",
          },
        },
      },
      {
        skill_map_results: {
          users: {
            first_name: "asc",
          },
        },
      },
      {
        skills: {
          name: "asc",
        },
      },
    ]
  }

  if (sortBy === SkillMapSearchSortOptions.SKILL) {
    orderBy = [
      {
        skill_map_results: {
          submitted_date: "desc",
        },
      },
      {
        skills: {
          name: "asc",
        },
      },
      {
        skill_map_results: {
          users: {
            last_name: "asc",
          },
        },
      },
      {
        skill_map_results: {
          users: {
            first_name: "asc",
          },
        },
      },
    ]
  }

  return await prisma.skill_map_ratings.findMany({
    skip,
    take,
    select: {
      id: true,
      skill_map_administrations: {
        select: {
          id: true,
          skill_map_period_end_date: true,
        },
      },
      skill_map_results: {
        select: {
          submitted_date: true,
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
      skills: {
        select: {
          id: true,
          name: true,
        },
      },
      answer_options: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where,
    orderBy,
    distinct: ["user_id", "skill_id"],
  })
}

export const countAllByFiltersDistinctBySkill = async (
  where: Prisma.skill_map_ratingsWhereInput
) => {
  const skillMapResults = await prisma.skill_map_ratings.groupBy({
    by: ["user_id", "skill_id"],
    where,
  })
  return skillMapResults.length
}

export const countAllByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  return await prisma.skill_map_results.count({
    where,
  })
}
