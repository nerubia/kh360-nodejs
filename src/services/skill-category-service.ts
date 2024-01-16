import * as SkillCategoryRepository from "../repositories/skill-category-repository"

export const getAllSkillCategories = async () => {
  return await SkillCategoryRepository.getAllByFilters({
    status: true,
  })
}
