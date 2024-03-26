import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (where: Prisma.survey_template_question_rulesWhereInput) => {
  return await prisma.survey_template_question_rules.findMany({
    where,
  })
}
