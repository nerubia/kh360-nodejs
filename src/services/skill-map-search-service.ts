import * as SkillMapSearchRepository from "../repositories/skill-map-search-repository"
import * as SkillRepository from "../repositories/skill-repository"

export const getAllByFilters = async (name: string, skill: string, page: string) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const allRecentRating = await SkillMapSearchRepository.getLatestSkillMapRating()

  const filteredResultsByName = allRecentRating.filter((result) => {
    if (name !== undefined) {
      const user = result.users
      return user?.first_name?.toLowerCase().includes(name.toLowerCase()) ?? false
    }
    return true
  })

  const filteredResultsBySkill = []
  for (const result of filteredResultsByName) {
    if (skill !== undefined && skill.toLowerCase() !== "all") {
      const skills = skill.split(",")
      const matchesSkill = await Promise.all(
        result.skill_map_ratings.map(async (rating) => {
          const skillDetails = await SkillRepository.getById(rating.skill_id ?? 0)
          const skillName = skillDetails?.name ?? ""
          return skills.some((s) => skillName.toLowerCase() === s.toLowerCase())
        })
      )
      if (matchesSkill.some(Boolean)) {
        filteredResultsBySkill.push(result)
      }
    } else {
      filteredResultsBySkill.push(result)
    }
  }

  const totalItems = filteredResultsBySkill.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedResults = filteredResultsBySkill.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return {
    data: paginatedResults,
    pageInfo: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
    },
  }
}
