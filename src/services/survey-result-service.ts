import { SurveyResultStatus } from "../types/survey-result-type"
import * as SurveyResultRepository from "../repositories/survey-result-repository"
import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import * as SurveyAnswerRepository from "../repositories/survey-answer-repository"
import * as SurveyTemplateQuestionRepository from "../repositories/survey-template-question-repository"
import * as SurveyTemplateCategoryRepository from "../repositories/survey-template-category-repository"
import * as SurveyTemplateAnswerRepository from "../repositories/survey-template-answer-repository"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import * as EmailLogRepository from "../repositories/email-log-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
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
  user: UserToken,
  is_external: boolean
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

  let newEmployeeIds = []

  if (is_external) {
    newEmployeeIds = employeeIds.filter((employeeId) => {
      const surveyResult = surveyResults.find(
        (surveyResult) => surveyResult.external_respondent_id === employeeId
      )
      return surveyResult === undefined ? employeeId : null
    })
  } else {
    newEmployeeIds = employeeIds.filter((employeeId) => {
      const surveyResult = surveyResults.find((surveyResult) => surveyResult.user_id === employeeId)
      return surveyResult === undefined ? employeeId : null
    })
  }

  const currentDate = new Date()

  const data = newEmployeeIds.map((employeeId) => {
    return {
      survey_administration_id: surveyAdministration.id,
      user_id: is_external ? user.id : employeeId,
      is_external,
      external_respondent_id: is_external ? employeeId : null,
      status:
        surveyAdministration.status === SurveyAdministrationStatus.Ongoing
          ? SurveyResultStatus.Ongoing
          : SurveyResultStatus.Open,
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

  const companionSurveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    external_respondent_id: {
      in: newEmployeeIds,
    },
  })

  const result = { survey_administration_id: surveyAdministration.id }

  if (companionSurveyResults.length !== 0) {
    const survey_result_id = companionSurveyResults[0].id
    Object.assign(result, {
      survey_result_id,
    })
  }

  return result
}

export const getAllBySurveyAdminId = async (survey_administration_id: number) => {
  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id,
    external_respondent_id: null,
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
      const surveyAnswers = await SurveyAnswerRepository.getAllDistinctByFilters(
        {
          survey_result_id: surveyResult.id,
          status: SurveyAnswerStatus.Submitted,
        },
        ["survey_template_question_id"]
      )

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
      survey_admin_name: surveyAdministration.name ?? "",
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
    if (respondent !== null) {
      modifiedContent = modifiedContent.replace(
        "{{respondent_first_name}}",
        `${respondent.first_name}`
      )
      await sendMail(respondent.email, surveyAdministration.email_subject ?? "", modifiedContent)
    }
  }
}

export const getCompanionQuestionsById = async (survey_result_id: number) => {
  const surveyCompanionResult = await SurveyResultRepository.getById(survey_result_id)

  if (surveyCompanionResult === null) {
    throw new CustomError("Survey result not found", 400)
  }

  const surveyAdministration = await SurveyAdministrationRepository.getById(
    surveyCompanionResult.survey_administration_id
  )

  if (surveyAdministration === null) {
    throw new CustomError("Survey administration not found", 400)
  }

  const filter = {
    survey_template_id: surveyAdministration.survey_template_id ?? 0,
    deleted_at: null,
    is_active: true,
  }

  const surveyTemplateQuestions = await SurveyTemplateQuestionRepository.getAllByFilters(filter)

  const finalSurveyTemplateQuestions = await Promise.all(
    surveyTemplateQuestions.map(async (question) => {
      const surveyTemplateCategories = await SurveyTemplateCategoryRepository.getAllByFilters({
        survey_template_id: surveyAdministration.survey_template_id ?? 0,
        category_type: "answer",
        status: true,
      })

      const finalSurveyTemplateCategories = await Promise.all(
        surveyTemplateCategories.map(async (category) => {
          const surveyTemplateAnswers = await SurveyTemplateAnswerRepository.getAllByFilters({
            survey_template_category_id: category.id,
          })
          return {
            ...category,
            surveyTemplateAnswers,
          }
        })
      )

      const survey_answers = await SurveyAnswerRepository.getAllByFilters({
        user_id: surveyCompanionResult.user_id ?? 0,
        external_user_id: surveyCompanionResult.external_respondent_id ?? 0,
        survey_administration_id: surveyAdministration.id,
        survey_template_question_id: question.id,
      })

      const surveyTemplateAnswerIds = survey_answers.map(
        (answer) => answer.survey_template_answer_id
      )

      const surveyTemplateAnswers = await SurveyTemplateAnswerRepository.getAllByFilters({
        id: {
          in: surveyTemplateAnswerIds as number[],
        },
      })

      const totalAmount = surveyTemplateAnswers.reduce((acc, answer) => {
        const amount = answer.amount ?? 0
        return acc + amount
      }, 0)

      return {
        ...question,
        totalAmount,
        surveyTemplateCategories: finalSurveyTemplateCategories,
      }
    })
  )
  const survey_answers = await SurveyAnswerRepository.getAllByFilters({
    user_id: surveyCompanionResult.user_id ?? 0,
    external_user_id: surveyCompanionResult.external_respondent_id ?? 0,
    survey_administration_id: surveyAdministration.id,
  })

  const companionUser = await ExternalUserRepository.getById(
    surveyCompanionResult.external_respondent_id ?? 0
  )

  return {
    survey_template_questions: finalSurveyTemplateQuestions,
    survey_administration: surveyAdministration,
    survey_result_status: surveyCompanionResult.status,
    survey_result_companion: companionUser,
    survey_answers,
  }
}

export const getAllCompanionQuestions = async (
  survey_administration_id: number,
  user: UserToken
) => {
  const surveyCompanionResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id,
    status: SurveyResultStatus.Ongoing,
    user_id: user.id,
    external_respondent_id: {
      not: null,
    },
  })
  const surveyAdministration =
    await SurveyAdministrationRepository.getById(survey_administration_id)

  if (surveyAdministration === null) {
    throw new CustomError("Survey administration not found", 400)
  }

  const finalCompanionResults = await Promise.all(
    surveyCompanionResults.map(async (companionResult) => {
      const filter = {
        survey_template_id: surveyAdministration.survey_template_id ?? 0,
        deleted_at: null,
        is_active: true,
      }

      const surveyTemplateQuestions = await SurveyTemplateQuestionRepository.getAllByFilters(filter)

      const finalSurveyTemplateQuestions = await Promise.all(
        surveyTemplateQuestions.map(async (question) => {
          const surveyTemplateCategories = await SurveyTemplateCategoryRepository.getAllByFilters({
            survey_template_id: surveyAdministration.survey_template_id ?? 0,
            category_type: "answer",
            status: true,
          })

          const finalSurveyTemplateCategories = await Promise.all(
            surveyTemplateCategories.map(async (category) => {
              const surveyTemplateAnswers = await SurveyTemplateAnswerRepository.getAllByFilters({
                survey_template_category_id: category.id,
              })
              return {
                ...category,
                surveyTemplateAnswers,
              }
            })
          )

          const survey_answers = await SurveyAnswerRepository.getAllByFilters({
            user_id: companionResult.external_respondent_id ?? 0,
            survey_administration_id,
            survey_template_question_id: question.id,
          })

          const surveyTemplateAnswerIds = survey_answers.map(
            (answer) => answer.survey_template_answer_id
          )

          const surveyTemplateAnswers = await SurveyTemplateAnswerRepository.getAllByFilters({
            id: {
              in: surveyTemplateAnswerIds as number[],
            },
          })

          const totalAmount = surveyTemplateAnswers.reduce((acc, answer) => {
            const amount = answer.amount ?? 0
            return acc + amount
          }, 0)

          return {
            ...question,
            totalAmount,
            surveyTemplateCategories: finalSurveyTemplateCategories,
          }
        })
      )
      const survey_answers = await SurveyAnswerRepository.getAllByFilters({
        user_id: companionResult.external_respondent_id ?? 0,
        survey_administration_id,
      })

      return {
        survey_template_questions: finalSurveyTemplateQuestions,
        survey_administration: surveyAdministration,
        survey_result_status: companionResult.status,
        survey_answers,
      }
    })
  )

  return finalCompanionResults
}

export const getResultsByRespondent = async (id: number) => {
  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: id,
  })
  return surveyResults
}

export const getResultsByAnswer = async (id: number) => {
  const surveyAnswers = await SurveyAnswerRepository.getAllDistinctByFilters(
    {
      survey_administration_id: id,
    },
    ["survey_template_answer_id"]
  )

  const finalSurveyAnswers = await Promise.all(
    surveyAnswers.map(async (answer) => {
      const totalRespondents = []

      const allSurveyAnswers = await SurveyAnswerRepository.getAllDistinctByFilters(
        {
          survey_template_answer_id: answer.survey_template_answer_id,
          survey_administration_id: id,
        },
        ["user_id"]
      )

      for (const surveyAnswer of allSurveyAnswers) {
        const users = await UserRepository.getById(surveyAnswer.user_id)
        totalRespondents.push(users)
      }

      return {
        ...answer,
        totalCount: allSurveyAnswers.length,
        users: totalRespondents,
      }
    })
  )

  return finalSurveyAnswers
}
