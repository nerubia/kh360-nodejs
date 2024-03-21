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
