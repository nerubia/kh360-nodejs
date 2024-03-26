import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.survey_template_questions.findUnique({
    where: {
      id,
    },
  })
}

export const getByFilters = async (where: Prisma.survey_template_questionsWhereInput) => {
  return await prisma.survey_template_questions.findFirst({
    where,
  })
}

export const getAllByFilters = async (where: Prisma.survey_template_questionsWhereInput) => {
  return await prisma.survey_template_questions.findMany({
    where,
    select: {
      id: true,
      sequence_no: true,
      question_text: true,
      question_type: true,
      is_active: true,
      is_required: true,
      survey_template_question_rules: true,
    },
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.survey_template_questionsWhereInput
) => {
  return await prisma.survey_template_questions.findMany({
    skip,
    take,
    where,
    orderBy: {
      sequence_no: "asc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.survey_template_questionsWhereInput) => {
  const count = await prisma.survey_template_questions.count({
    where,
  })

  return count
}
