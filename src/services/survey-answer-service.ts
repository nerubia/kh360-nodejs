import * as SurveyAnswerRepository from "../repositories/survey-answer-repository"

export const updateStatusByAdministrationId = async (
  survey_administration_id: number,
  status: string
) => {
  await SurveyAnswerRepository.updateStatusByAdministrationId(survey_administration_id, status)
}
