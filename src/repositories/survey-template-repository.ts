import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (where: Prisma.survey_templatesWhereInput) => {
  return await prisma.survey_templates.findMany({
    where,
  })
}
