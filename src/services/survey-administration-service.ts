import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import * as SurveyResultRepository from "../repositories/survey-result-repository"
import * as SurveyAnswerRepository from "../repositories/survey-answer-repository"
import * as UserRepository from "../repositories/user-repository"
import * as SystemSettingsRepository from "../repositories/system-settings-repository"
import { sendMail } from "../utils/sendgrid"
import {
  SurveyAdministrationStatus,
  type SurveyAdministration,
} from "../types/survey-administration-type"
import CustomError from "../utils/custom-error"
import { format } from "date-fns"
import { SurveyAnswerStatus } from "../types/survey-answer-type"
import { SurveyResultStatus } from "../types/survey-result-type"
import { removeWhitespace } from "../utils/format-string"
import { EmailSender } from "../types/email-sender"

export const getAllByFilters = async (name: string, status: string, page: string) => {
  const itemsPerPage = 10
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where = {
    name: {
      contains: name,
    },
  }

  if (status !== undefined && status !== "all") {
    const statuses = status.split(",")
    Object.assign(where, {
      status: {
        in: statuses,
      },
    })
  }
  const surveyAdministrations = await SurveyAdministrationRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await SurveyAdministrationRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: surveyAdministrations,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const getAllByStatus = async (status: string) => {
  return await SurveyAdministrationRepository.getAllByFilters({ status })
}

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await SurveyAdministrationRepository.getAllByStatusAndDate(status, date)
}

export const getAllByStatusAndEndDate = async (status: string, date: Date) => {
  return await SurveyAdministrationRepository.getAllByStatusAndEndDate(status, date)
}

export const create = async (data: SurveyAdministration) => {
  const { name } = data
  const existingSurveyAdmin = await SurveyAdministrationRepository.getByName(removeWhitespace(name))
  if (existingSurveyAdmin !== null) {
    throw new CustomError("Survey name should be unique", 400)
  }
  return await SurveyAdministrationRepository.create(data)
}

export const updateById = async (id: number, data: SurveyAdministration) => {
  const surveyAdministration = await SurveyAdministrationRepository.getById(id)
  if (surveyAdministration === null) {
    throw new CustomError("Invalid Id.", 400)
  }
  const existingSurveyAdmin = await SurveyAdministrationRepository.getByName(
    removeWhitespace(data.name)
  )
  if (existingSurveyAdmin !== null) {
    if (surveyAdministration.id !== existingSurveyAdmin.id) {
      throw new CustomError("Survey name should be unique", 400)
    }
  }
  if (
    surveyAdministration.status !== SurveyAdministrationStatus.Draft &&
    surveyAdministration.status !== SurveyAdministrationStatus.Pending
  ) {
    throw new CustomError("Only Draft and Pending status is allowed.", 403)
  }

  const currentDate = new Date()

  if (
    data.survey_start_date != null &&
    data.survey_start_date <= currentDate &&
    data.status === SurveyAdministrationStatus.Pending
  ) {
    await SurveyAdministrationRepository.updateStatusById(id, SurveyAdministrationStatus.Processing)
  }

  return await SurveyAdministrationRepository.updateById(id, data)
}

export const getById = async (id: number) => {
  return await SurveyAdministrationRepository.getById(id)
}

export const deleteById = async (id: number) => {
  const survey = await SurveyAdministrationRepository.getById(id)
  if (survey === null) {
    throw new CustomError("Survey administration not found", 400)
  }
  if (survey.status !== SurveyAdministrationStatus.Draft) {
    throw new CustomError("This action is not allowed", 400)
  }
  return await SurveyAdministrationRepository.deleteById(id)
}

export const updateStatusById = async (id: number, status: string) => {
  await SurveyAdministrationRepository.updateStatusById(id, status)
}

export const sendSurveyEmailById = async (id: number) => {
  const surveyAdministration = await SurveyAdministrationRepository.getById(id)

  if (surveyAdministration !== null) {
    const surveyResults = await SurveyResultRepository.getAllByFilters({
      survey_administration_id: surveyAdministration.id,
    })

    const systemSettings = await SystemSettingsRepository.getByName(EmailSender.SURVEY)

    for (const surveyResult of surveyResults) {
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
      const respondent = await UserRepository.getById(surveyResult.user_id ?? 0)
      modifiedContent = modifiedContent.replace(
        "{{link}}",
        `<a href='${process.env.APP_URL}/survey-forms/${surveyAdministration.id}'>link</a>`
      )
      if (respondent !== null) {
        modifiedContent = modifiedContent.replace(
          "{{respondent_first_name}}",
          `${respondent.first_name}`
        )
        await sendMail({
          to: [respondent.email],
          from: systemSettings?.value,
          subject: surveyAdministration.email_subject ?? "",
          content: modifiedContent,
        })
      }
    }
  }
}

export const close = async (id: number) => {
  const surveyAdministration = await SurveyAdministrationRepository.getById(id)

  if (surveyAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (surveyAdministration.status !== SurveyAdministrationStatus.Ongoing) {
    throw new CustomError("Only ongoing status is allowed.", 403)
  }

  await SurveyAdministrationRepository.updateStatusById(
    surveyAdministration.id,
    SurveyAdministrationStatus.Closed
  )

  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    survey_answers: {
      some: {},
    },
  })

  const noAnswerSurveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: { in: [SurveyResultStatus.Ongoing, SurveyResultStatus.Open] },
    survey_answers: {
      none: {},
    },
  })

  for (const surveyResult of surveyResults) {
    if (surveyResult.status === SurveyResultStatus.Draft) {
      await SurveyResultRepository.updateById(surveyResult.id, {
        status: SurveyResultStatus.NoResult,
      })
    } else {
      await SurveyResultRepository.updateById(surveyResult.id, {
        status: SurveyResultStatus.Closed,
      })
    }
  }

  for (const noAnswerSurveyResult of noAnswerSurveyResults) {
    await SurveyResultRepository.updateById(noAnswerSurveyResult.id, {
      status: SurveyResultStatus.NoResult,
    })
  }

  const surveyAnswers = await SurveyAnswerRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: {
      in: [SurveyAnswerStatus.Pending, SurveyAnswerStatus.Open, SurveyAnswerStatus.Ongoing],
    },
  })

  for (const surveyAnswer of surveyAnswers) {
    await SurveyAnswerRepository.updateById(surveyAnswer.id, {
      status: SurveyAnswerStatus.Expired,
    })
  }
}

export const cancel = async (id: number) => {
  const surveyAdministration = await SurveyAdministrationRepository.getById(id)

  if (surveyAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (
    surveyAdministration.status !== SurveyAdministrationStatus.Pending &&
    surveyAdministration.status !== SurveyAdministrationStatus.Ongoing
  ) {
    throw new CustomError("Only ongoing or pending status is allowed.", 403)
  }

  await SurveyAdministrationRepository.updateStatusById(
    surveyAdministration.id,
    SurveyAdministrationStatus.Cancelled
  )

  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
  })

  for (const surveyResult of surveyResults) {
    await SurveyResultRepository.updateById(surveyResult.id, {
      status: SurveyResultStatus.Cancelled,
    })
  }

  const surveyAnswers = await SurveyAnswerRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: {
      in: [SurveyAnswerStatus.Pending, SurveyAnswerStatus.Open, SurveyAnswerStatus.Ongoing],
    },
  })

  for (const surveyAnswer of surveyAnswers) {
    await SurveyAnswerRepository.updateById(surveyAnswer.id, {
      status: SurveyAnswerStatus.Cancelled,
    })
  }
}

export const reopen = async (id: number) => {
  const surveyAdministration = await SurveyAdministrationRepository.getById(id)

  if (surveyAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  if (surveyAdministration.status !== SurveyAdministrationStatus.Closed) {
    throw new CustomError("Only closed status is allowed.", 403)
  }

  await SurveyAdministrationRepository.updateStatusById(
    surveyAdministration.id,
    SurveyAdministrationStatus.Ongoing
  )

  const surveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: SurveyResultStatus.Closed,
  })

  for (const surveyResult of surveyResults) {
    await SurveyResultRepository.updateById(surveyResult.id, {
      status: SurveyResultStatus.Submitted,
    })
  }

  const noResultSurveyResults = await SurveyResultRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: SurveyResultStatus.NoResult,
  })

  for (const surveyResult of noResultSurveyResults) {
    await SurveyResultRepository.updateById(surveyResult.id, {
      status: SurveyResultStatus.Ongoing,
    })
  }

  const surveyAnswers = await SurveyAnswerRepository.getAllByFilters({
    survey_administration_id: surveyAdministration.id,
    status: SurveyAnswerStatus.Expired,
  })

  for (const surveyAnswer of surveyAnswers) {
    await SurveyAnswerRepository.updateById(surveyAnswer.id, {
      status: SurveyAnswerStatus.Open,
    })
  }
}
