import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"

export const getById = async (id: number) => {
  return await prisma.users.findUnique({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      slug: true,
      picture: true,
    },
    where: {
      id,
    },
  })
}

export const getByEmail = async (email: string) => {
  return await prisma.users.findUnique({
    where: {
      email,
    },
    include: {
      user_details: {
        select: {
          user_type: true,
        },
      },
      user_settings: {
        select: {
          id: true,
          name: true,
          setting: true,
        },
      },
    },
  })
}

export const getAllByFilters = async (where: Prisma.usersWhereInput) => {
  return await prisma.users.findMany({
    where,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      is_active: true,
    },
    orderBy: [
      {
        last_name: "asc",
      },
      {
        first_name: "asc",
      },
    ],
  })
}

export const countByFilters = async (where: Prisma.usersWhereInput) => {
  return await prisma.users.count({
    where,
  })
}

export const getAllByFiltersWithPaging = async (
  where: Prisma.usersWhereInput,
  currentPage: number,
  itemsPerPage: number
) => {
  return await prisma.users.findMany({
    where,
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      is_active: true,
      user_details: {
        select: {
          id: true,
          user_id: true,
          start_date: true,
          user_type: true,
          user_position: true,
        },
      },
    },
    orderBy: [
      {
        last_name: "asc",
      },
      {
        first_name: "asc",
      },
    ],
  })
}

export const getAllRecentRating = async (userId: number) => {
  return await prisma.skill_map_administrations.findMany({
    where: {
      status: {
        notIn: [SkillMapAdministrationStatus.Cancelled],
      },
      skill_map_results: {
        some: {
          user_id: userId,
        },
      },
    },
    select: {
      skill_map_period_end_date: true,
      skill_map_results: {
        where: {
          user_id: userId,
        },
        select: {
          skill_map_ratings: {
            select: {
              skill_id: true,
              skills: {
                select: {
                  name: true,
                },
              },
              answer_option_id: true,
              created_at: true,
            },
            where: {
              status: "Submitted",
            },
          },
        },
      },
    },
    orderBy: {
      skill_map_period_end_date: "asc",
    },
  })
}
export const getSingleLatestRating = async (userId: number) => {
  const latestRating = await prisma.skill_map_ratings.findFirst({
    where: {
      skill_map_results: {
        user_id: userId,
        status: SkillMapRatingStatus.Submitted,
      },
    },
    select: {
      skill_id: true,
      skills: {
        select: {
          name: true,
        },
      },
      answer_option_id: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  if (latestRating == null) {
    return null
  }

  const { skill_id } = latestRating

  const allRatingsForLatestSkill = await prisma.skill_map_ratings.findMany({
    where: {
      skill_id,
      skill_map_results: {
        user_id: userId,
        status: SkillMapRatingStatus.Submitted,
      },
    },
    select: {
      skill_id: true,
      skills: {
        select: {
          name: true,
        },
      },
      answer_option_id: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  })

  return {
    skill_map_rating: {
      user_latest_skill_map_result: latestRating,
      all_ratings_for_latest_skill: allRatingsForLatestSkill,
    },
  }
}

export const getLatestSkillMapRating = async () => {
  return await prisma.skill_map_results.findMany({
    where: {
      status: "Submitted",
    },
    select: {
      id: true,
      skill_map_administration_id: true,
      status: true,
      comments: true,
      submitted_date: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      submitted_date: "desc",
    },
    distinct: ["user_id"],
  })
}
