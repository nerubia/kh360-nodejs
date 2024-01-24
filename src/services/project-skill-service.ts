import * as ProjectSkillRepository from "../repositories/project-skill-repository"

export const getAllByFilters = async (
  project_id: string,
  name: string,
  skill_category_id: string,
  page: string
) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const projectSkills = await ProjectSkillRepository.getAllByFilters({
    project_id: parseInt(project_id),
  })

  const projectSkillIds = projectSkills.map((skill) => skill.id)

  const where = {
    id: {
      in: projectSkillIds,
    },
    skills: {},
  }

  if (skill_category_id !== undefined && skill_category_id !== "all") {
    Object.assign(where, {
      skills: {
        skill_category_id: parseInt(skill_category_id),
      },
    })
  }

  if (name !== undefined) {
    Object.assign(where, {
      skills: {
        ...where.skills,
        name: {
          contains: name,
        },
      },
    })
  }

  const totalItems = await ProjectSkillRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const skills = await ProjectSkillRepository.getAllByFiltersWithPaging(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const finalSkills = skills.map((skill) => skill.skills)

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: finalSkills,
    pageInfo,
  }
}
