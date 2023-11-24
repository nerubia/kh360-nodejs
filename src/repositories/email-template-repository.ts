import prisma from "../utils/prisma"
import { TemplateType } from "../types/email-template-type"

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
