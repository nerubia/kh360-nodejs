import { type SurveyResult } from "../types/survey-result-type"
import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: SurveyResult[]) => {
  return await prisma.survey_results.createMany({
    data,
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
        },
      },
      survey_administration_id: true,
    },
    where,
  })
}
