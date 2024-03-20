import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import {
  SurveyAdministrationStatus,
  type SurveyAdministrationType,
} from "../types/survey-administration-type"
import CustomError from "../utils/custom-error"

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

export const create = async (data: SurveyAdministrationType) => {
  return await SurveyAdministrationRepository.create(data)
}

export const updateById = async (id: number, data: SurveyAdministrationType) => {
  const survey = await SurveyAdministrationRepository.getById(id)
  if (survey === null) {
    throw new CustomError("Invalid Id.", 400)
  }
  if (survey === null) {
    throw new CustomError("Survey administration not found", 400)
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
