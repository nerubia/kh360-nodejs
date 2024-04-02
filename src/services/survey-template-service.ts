import * as SurveyTemplateRepository from "../repositories/survey-template-repository"

export const getAllSurveyTemplates = async () => {
  return await SurveyTemplateRepository.getAllByFilters({
    is_active: true,
  })
}
