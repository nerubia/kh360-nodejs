import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const getById = async (id: number) => {
  return await prisma.evaluation_template_contents.findUnique({
    where: {
      id,
    },
  })
}

export const getByEvaluationTemplateId = async (evaluation_template_id: number) => {
  return await prisma.evaluation_template_contents.findFirst({
    where: {
      evaluation_template_id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.evaluation_template_contentsWhereInput) => {
  return await prisma.evaluation_template_contents.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    where,
  })
}
