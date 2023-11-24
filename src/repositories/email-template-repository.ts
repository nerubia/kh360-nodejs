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

export const getNARatingTemplates = async () => {
  return await prisma.email_templates.findMany({
    where: {
      template_type: TemplateType.NARating,
    },
  })
}
