import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getAllByFilters = async (where: Prisma.survey_template_categoriesWhereInput) => {
  return await prisma.survey_template_categories.findMany({
    where,
    orderBy: {
      sequence_no: "asc",
    },
  })
}
