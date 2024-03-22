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
      survey_template_answer_id: true,
    },
    where,
  })
}

export const updateStatusByAdministrationId = async (
  survey_administration_id: number,
  status: string
) => {
  await prisma.survey_answers.updateMany({
    where: {
      survey_administration_id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const updateById = async (id: number, data: Prisma.survey_answersUpdateInput) => {
  await prisma.survey_answers.update({
    where: {
      id,
    },
    data,
  })
}

export const countByFilters = async (where: Prisma.survey_answersWhereInput) => {
  return await prisma.survey_answers.count({
    where,
  })
}
