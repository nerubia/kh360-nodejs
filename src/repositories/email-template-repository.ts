import prisma from "../utils/prisma"
import { type EmailTemplate, TemplateType } from "../types/email-template-type"
import { type Prisma } from "@prisma/client"

export const getDefault = async () => {
  return await prisma.email_templates.findFirst({
    where: {
      template_type: TemplateType.CreateEvaluation,
      is_default: true,
    },
  })
}

export const getByTemplateType = async (template_type: string) => {
  return await prisma.email_templates.findFirst({
    where: {
      template_type,
    },
  })
}

export const getRatingTemplates = async () => {
  return await prisma.email_templates.findMany({
    where: {
      template_type: {
        in: [TemplateType.NARating, TemplateType.HighRating, TemplateType.LowRating],
      },
    },
  })
}
export const getAllByFilters = async (
  skip: number,
  take: number,
  where: Prisma.email_templatesWhereInput
) => {
  return await prisma.email_templates.findMany({
    skip,
    take,
    where,
  })
}

export const getById = async (id: number) => {
  return await prisma.email_templates.findUnique({
    where: {
      id,
    },
  })
}

export const countByFilters = async (where: Prisma.email_templatesWhereInput) => {
  return await prisma.email_templates.count({
    where,
  })
}

export const create = async (data: EmailTemplate) => {
  return await prisma.email_templates.create({
    data,
  })
}

export const updateById = async (id: number, data: EmailTemplate) => {
  return await prisma.email_templates.update({
    where: {
      id,
    },
    data,
  })
}

export const deleteById = async (id: number) => {
  await prisma.email_templates.deleteMany({
    where: {
      id,
    },
  })
}
