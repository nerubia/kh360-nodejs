import * as SurveyTemplateRepository from "../repositories/survey-template-repository"

export const getAllSkillCategories = async () => {
  return await SurveyTemplateRepository.getAllByFilters({
    is_active: true,
  })
}
