import { type SurveyAnswer } from "../types/survey-answer-type"
import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: SurveyAnswer[]) => {
  return await prisma.survey_answers.createMany({
    data,
  })
}

export const getAllByFilters = async (where: Prisma.survey_answersWhereInput) => {
  return await prisma.survey_answers.findMany({
    select: {
      id: true,
      user_id: true,
      users: {
        select: {
          id: true,
        },
      },
      survey_administration_id: true,
    },
    where,
  })
}
