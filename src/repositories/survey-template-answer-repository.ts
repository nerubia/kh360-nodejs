import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (where: Prisma.survey_template_answersWhereInput) => {
  return await prisma.survey_template_answers.findMany({
    where,
  })
}
