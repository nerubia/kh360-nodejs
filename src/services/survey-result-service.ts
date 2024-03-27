import { SurveyResultStatus } from "../types/survey-result-type"
import * as SurveyResultRepository from "../repositories/survey-result-repository"
import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import * as SurveyAnswerRepository from "../repositories/survey-answer-repository"
import * as SurveyTemplateQuestionRepository from "../repositories/survey-template-question-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EmailLogRepository from "../repositories/email-log-repository"
import * as UserRepository from "../repositories/user-repository"
import CustomError from "../utils/custom-error"
import { type UserToken } from "../types/user-token-type"
import { SurveyAdministrationStatus } from "../types/survey-administration-type"
import { sendMail } from "../utils/sendgrid"
import { format } from "date-fns"
import { EmailLogType, type EmailLog } from "../types/email-log-type"
import { SurveyAnswerStatus } from "../types/survey-answer-type"

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
      status:
        surveyAdministration.status === SurveyAdministrationStatus.Ongoing
          ? SurveyResultStatus.Ongoing
          : SurveyResultStatus.ForReview,
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

    if (surveyAdministration.status === SurveyAdministrationStatus.Ongoing) {
      await sendSurveyEmailByRespondentId(respondentId, surveyAdministration.id)
    }
  }

  if (surveyAdministration.status === SurveyAdministrationStatus.Draft) {
    await SurveyAdministrationRepository.updateStatusById(
      surveyAdministration.id,
      surveyAdministration.survey_start_date != null &&
        surveyAdministration.survey_start_date > currentDate
        ? SurveyAdministrationStatus.Pending
        : SurveyAdministrationStatus.Processing
    )
  }

  return { survey_administration_id: surveyAdministration.id }
}

export const getAllBySurveyAdminId = async (survey_administration_id: number) => {
  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id,
    deleted_at: null,
  })

  const surveyAdministration =
    await SurveyAdministrationRepository.getById(survey_administration_id)

  const finalSurveyResults = await Promise.all(
    surveyResults.map(async (surveyResult) => {
      const surveyTemplateQuestions = await SurveyTemplateQuestionRepository.getAllByFilters({
        survey_template_id: surveyAdministration?.survey_template_id ?? 0,
      })

      const total_questions = surveyTemplateQuestions.length
      const surveyAnswers = await SurveyAnswerRepository.getAllDistinctByFilters({
        survey_result_id: surveyResult.id,
        status: SurveyAnswerStatus.Submitted,
      })

      const total_answered = surveyAnswers.filter(
        (answer) => answer.survey_template_answer_id !== null
      ).length
      const email_logs = await EmailLogRepository.getByEmailAndType(
        surveyResult.users.email,
        "Survey Reminder"
      )

      return {
        ...surveyResult,
        total_questions,
        total_answered,
        email_logs,
      }
    })
  )

  return finalSurveyResults
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await SurveyResultRepository.updateStatusByAdministrationId(evaluation_administration_id, status)
}

export const sendReminderByRespondent = async (
  survey_administration_id: number,
  user_id: number
) => {
  const surveyAdministration =
    await SurveyAdministrationRepository.getById(survey_administration_id)

  if (surveyAdministration === null) {
    throw new CustomError("Survey administration not found", 400)
  }

  const emailTemplate = await EmailTemplateRepository.getByTemplateType("Survey Reminder")

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  const respondent = await UserRepository.getById(user_id)

  if (respondent === null) {
    throw new CustomError("Respondent not found", 400)
  }

  const emailContent = emailTemplate.content ?? ""
  const scheduleEndDate = format(
    surveyAdministration.survey_end_date ?? new Date(),
    "EEEE, MMMM d, yyyy"
  )

  const replacements: Record<string, string> = {
    survey_admin_name: surveyAdministration.name ?? "",
    survey_end_date: scheduleEndDate,
  }

  let modifiedContent: string = emailContent.replace(/{{(.*?)}}/g, (match: string, p1: string) => {
    return replacements[p1] ?? match
  })
  modifiedContent = modifiedContent.replace(/(?:\r\n|\r|\n)/g, "<br>")
  modifiedContent = modifiedContent.replace(
    "{{link}}",
    `<a href='${process.env.APP_URL}/survey-forms/${surveyAdministration.id}'>link</a>`
  )
  modifiedContent = modifiedContent.replace("{{respondent_first_name}}", `${respondent.first_name}`)

  const currentDate = new Date()
  const emailLogData: EmailLog = {
    content: modifiedContent,
    created_at: currentDate,
    email_address: respondent.email,
    email_status: EmailLogType.Pending,
    email_type: emailTemplate.template_type,
    mail_id: "",
    notes: `{"survey_administration_id": ${surveyAdministration.id}}`,
    sent_at: currentDate,
    subject: emailTemplate.subject,
    updated_at: currentDate,
    user_id: respondent.id,
  }

  if (respondent !== null) {
    const sgResp = await sendMail(respondent.email, emailTemplate.subject ?? "", modifiedContent)
    if (sgResp !== null && sgResp !== undefined) {
      const mailId = sgResp[0].headers["x-message-id"]
      emailLogData.mail_id = mailId
      emailLogData.email_status = EmailLogType.Sent
    } else {
      emailLogData.email_status = EmailLogType.Error
    }

    await EmailLogRepository.create(emailLogData)

    return emailLogData
  }
}

export const sendSurveyEmailByRespondentId = async (
  user_id: number,
  survey_administration_id: number
) => {
  const surveyAdministration =
    await SurveyAdministrationRepository.getById(survey_administration_id)

  if (surveyAdministration !== null) {
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
    const respondent = await UserRepository.getById(user_id ?? 0)
    modifiedContent = modifiedContent.replace(
      "{{link}}",
      `<a href='${process.env.APP_URL}/survey-forms/${surveyAdministration.id}'>link</a>`
    )
    modifiedContent = modifiedContent.replace("{{passcode}}", "")
    if (respondent !== null) {
      await sendMail(respondent.email, surveyAdministration.email_subject ?? "", modifiedContent)
    }
  }
}
