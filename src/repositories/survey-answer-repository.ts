import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: Prisma.survey_answersUncheckedCreateInput[]) => {
  return await prisma.survey_answers.createMany({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.survey_answers.findUnique({
    where: {
      id,
    },
  })
}

export const getByFilters = async (where: Prisma.survey_answersWhereInput) => {
  return await prisma.survey_answers.findFirst({
    where,
  })
}

export const updateByid = async (id: number, data: Prisma.survey_answersUncheckedUpdateInput) => {
  return await prisma.survey_answers.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
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
          first_name: true,
          last_name: true,
        },
      },
      survey_administration_id: true,
      survey_template_answer_id: true,
      survey_template_question_id: true,
      survey_template_answers: true,
    },
    where,
  })
}

export const getAllDistinctByFilters = async (
  where: Prisma.survey_answersWhereInput,
  distinct: Prisma.Survey_answersScalarFieldEnum[]
) => {
  return await prisma.survey_answers.findMany({
    where,
    select: {
      id: true,
      user_id: true,
      survey_administration_id: true,
      survey_template_answer_id: true,
      survey_template_question_id: true,
      survey_template_answers: true,
    },
    distinct,
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