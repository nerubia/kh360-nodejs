import { type Prisma } from "@prisma/client"
import * as SkillMapSearchRepository from "../repositories/skill-map-search-repository"
import { SkillMapResultStatus } from "../types/skill-map-result-type"
import { constructNameFilter } from "../utils/format-filter"

export const getAllByFilters = async (
  name: string,
  skill: string,
  sortBy: string,
  page: string
) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.skill_map_ratingsWhereInput = {
    skill_map_results: {
      status: {
        in: [SkillMapResultStatus.Submitted, SkillMapResultStatus.Closed],
      },
    },
  }

  if (name !== undefined) {
    const whereClause = constructNameFilter(name)
    Object.assign(where, {
      skill_map_results: {
        ...where.skill_map_results,
        users: {
          ...whereClause,
        },
      },
    })
  }

  if (skill !== undefined && skill.toLowerCase() !== "all") {
    Object.assign(where, {
      skills: {
        name: skill,
      },
    })
  }

  const skillMapRatings = await SkillMapSearchRepository.getLatestSkillMapRating(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    sortBy
  )

  const totalItems = await SkillMapSearchRepository.countAllByFiltersDistinctBySkill(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: skillMapRatings,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
