import { SurveyResultStatus } from "../types/survey-result-type"
import * as SurveyResultRepository from "../repositories/survey-result-repository"
import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import * as SurveyTemplateAnswerRepository from "../repositories/survey-template-answer-repository"
import * as SurveyAnswerRepository from "../repositories/survey-answer-repository"
import * as UserRepository from "../repositories/user-repository"
import CustomError from "../utils/custom-error"
import { type SurveyAnswer, SurveyAnswerStatus } from "../types/survey-answer-type"
import { sendMail } from "../utils/sendgrid"
import { format } from "date-fns"
import { type UserToken } from "../types/user-token-type"

export const create = async (
  survey_administration_id: number,
  employee_ids: number[],
  user: UserToken
) => {
  const employeeIds = employee_ids

  if (employeeIds.length === 0) {
    throw new CustomError("Must have at least 1 employee selected.", 400)
  }

  const surveyAdministration =
    await SurveyAdministrationRepository.getById(survey_administration_id)

  if (surveyAdministration === null) {
    throw new CustomError("Invalid id.", 400)
  }

  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
  })

  const newEmployeeIds = employeeIds.filter((employeeId) => {
    const surveyResult = surveyResults.find((surveyResult) => surveyResult.user_id === employeeId)
    return surveyResult === undefined ? employeeId : null
  })

  const currentDate = new Date()

  const data = newEmployeeIds.map((employeeId) => {
    return {
      survey_administration_id: surveyAdministration.id,
      user_id: employeeId,
      status: SurveyResultStatus.ForReview,
      created_by_id: user.id,
      updated_by_id: user.id,
      created_at: currentDate,
      updated_at: currentDate,
    }
  })

  await SurveyResultRepository.createMany(data)

  const newSurveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    user_id: {
      in: newEmployeeIds,
    },
  })

  for (const surveyResult of newSurveyResults) {
    const respondentId = surveyResult.users?.id

    const surveyAnswers: SurveyAnswer[] = []

    const surveyTemplateAnswers = await SurveyTemplateAnswerRepository.getAllByFilters({
      survey_template_id: surveyAdministration.survey_template_id ?? 0,
    })

    for (const surveyTemplateAnswer of surveyTemplateAnswers) {
      surveyAnswers.push({
        survey_administration_id: surveyAdministration.id,
        survey_result_id: surveyResult.id,
        user_id: respondentId,
        survey_template_id: surveyAdministration.survey_template_id ?? 0,
        survey_template_question_id: surveyTemplateAnswer.survey_template_question_id,
        status: SurveyAnswerStatus.Draft,
        created_by_id: user.id,
        updated_by_id: user.id,
        created_at: currentDate,
        updated_at: currentDate,
      })
    }

    await SurveyAnswerRepository.createMany(surveyAnswers)

    const emailContent = surveyAdministration.email_content ?? ""

    const scheduleEndDate = format(
      surveyAdministration.survey_end_date ?? new Date(),
      "EEEE, MMMM d, yyyy"
    )

    const replacements: Record<string, string> = {
      survey_name: surveyAdministration.name ?? "",
      survey_end_date: scheduleEndDate,
    }

    let modifiedContent: string = emailContent.replace(
      /{{(.*?)}}/g,
      (match: string, p1: string) => {
        return replacements[p1] ?? match
      }
    )
    modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
    const respondent = await UserRepository.getById(surveyResult.user_id ?? 0)
    modifiedContent = modifiedContent.replace(
      "{{link}}",
      `<a href='${process.env.APP_URL}/survey-administrations/${surveyAdministration.id}'>link</a>`
    )
    modifiedContent = modifiedContent.replace("{{passcode}}", "")
    if (respondent !== null) {
      await sendMail(respondent.email, surveyAdministration.email_subject ?? "", modifiedContent)
    }
  }

  return { survey_administration_id: surveyAdministration.id }
}

export const getAllBySurveyAdminId = async (survey_administration_id: number) => {
  return await SurveyResultRepository.getAllByFilters({
    survey_administration_id,
    deleted_at: null,
  })
}
