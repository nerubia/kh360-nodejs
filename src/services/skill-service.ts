import * as SkillRepository from "../repositories/skill-repository"

export const getAllByFilters = async (name: string, skill_category_id: string, page: string) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {}

  if (skill_category_id !== undefined && skill_category_id !== "all") {
    Object.assign(where, {
      skill_category_id: parseInt(skill_category_id),
    })
  }

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  const totalItems = await SkillRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const skills = await SkillRepository.getAllByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: skills,
    pageInfo,
  }
}
