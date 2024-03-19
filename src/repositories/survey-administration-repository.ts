import prisma from "../utils/prisma"
import { type SurveyAdministrationType } from "../types/survey-administration-type"

export const getById = async (id: number) => {
  return await prisma.survey_administrations.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (name: string, status: string) => {
  return await prisma.survey_administrations.findMany({
    where: {
      name: { contains: name },
      status: { equals: status },
    },
  })
}

export const create = async (data: SurveyAdministrationType) => {
  return await prisma.survey_administrations.create({
    data: {
      ...data,
      created_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      survey_start_date: true,
      survey_end_date: true,
      survey_template_id: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}
export const updateById = async (id: number, data: SurveyAdministrationType) => {
  return await prisma.survey_administrations.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      survey_start_date: true,
      survey_end_date: true,
      survey_template_id: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}
export const deleteById = async (id: number) => {
  return await prisma.survey_administrations.delete({
    where: {
      id,
    },
  })
}
