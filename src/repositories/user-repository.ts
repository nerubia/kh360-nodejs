import { type Prisma } from "@prisma/client"
import prisma from "../utils/prisma"
import { SkillMapAdministrationStatus } from "../types/skill-map-administration-type"
import { SkillMapResultStatus } from "../types/skill-map-result-type"

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
          status: {
            in: [SkillMapResultStatus.Submitted, SkillMapResultStatus.Closed],
          },
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
              answer_options: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

export const getUserSkillMapBySkillId = async (userId: number, skillId: number) => {
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
              answer_options: {
                select: {
                  id: true,
                  name: true,
                },
              },
              created_at: true,
            },
            where: {
              skill_id: skillId,
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
