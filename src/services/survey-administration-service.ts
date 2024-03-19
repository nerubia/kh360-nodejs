import * as SurveyAdministrationRepository from "../repositories/survey-administration-repository"
import {
  SurveyAdministrationStatus,
  type SurveyAdministrationType,
} from "../types/survey-administration-type"
import CustomError from "../utils/custom-error"

export const getAllByFilters = async (name: string, status: string) => {
  return await SurveyAdministrationRepository.getAllByFilters(name, status)
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
