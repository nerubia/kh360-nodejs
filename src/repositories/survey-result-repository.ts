import { type SurveyResult } from "../types/survey-result-type"
import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: SurveyResult[]) => {
  return await prisma.survey_results.createMany({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.survey_results.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.survey_resultsWhereInput) => {
  return await prisma.survey_results.findMany({
    select: {
      id: true,
      user_id: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      survey_administration_id: true,
    },
    where,
  })
}

export const getByFilters = async (where: Prisma.survey_resultsWhereInput) => {
  return await prisma.survey_results.findFirst({
    where,
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.survey_results.update({
    where: {
      id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const updateById = async (id: number, data: Prisma.survey_answersUpdateInput) => {
  await prisma.survey_results.update({
    where: {
      id,
    },
    data,
  })
}

export const updateStatusByAdministrationId = async (
  survey_administration_id: number,
  status: string
) => {
  await prisma.survey_results.updateMany({
    where: {
      survey_administration_id,
    },
    data: {
      status,
    },
  })
}
