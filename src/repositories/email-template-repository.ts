import prisma from "../utils/prisma"

export const getDefault = async () => {
  return await prisma.email_templates.findFirst({
    where: {
      template_type: "Create Evaluation",
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
