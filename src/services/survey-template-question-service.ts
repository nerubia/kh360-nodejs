import * as SurveyTemplateQuestionRepository from "../repositories/survey-template-question-repository"

export const getBySurveyTemplateId = async (survey_template_id: number) => {
  return await SurveyTemplateQuestionRepository.getAllByFilters({
    is_active: true,
    survey_template_id,
  })
}
