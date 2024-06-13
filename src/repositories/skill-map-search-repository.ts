import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import { SkillMapRatingStatus } from "../types/skill-map-rating-type"

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

export const getLatestSkillMapRating = async (name: string) => {
  const where = {
    status: "Submitted",
  }

  if (name !== undefined) {
    Object.assign(where, {
      users: {
        OR: [
          {
            first_name: {
              contains: name,
            },
          },
          {
            last_name: {
              contains: name,
            },
          },
        ],
      },
    })
  }

  return await prisma.skill_map_results.findMany({
    where,
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
      skill_map_ratings: {
        where: {
          status: SkillMapRatingStatus.Submitted,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 1,
        include: {
          skills: {
            select: {
              name: true,
            },
          },
          answer_options: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      submitted_date: "desc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.skill_map_resultsWhereInput) => {
  return await prisma.skill_map_results.count({
    where,
  })
}
