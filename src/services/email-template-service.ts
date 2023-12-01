import * as EmailTemplateRepository from "../repositories/email-template-repository"
import CustomError from "../utils/custom-error"

export const getDefault = async () => {
  return await EmailTemplateRepository.getDefault()
}

export const getByTemplateType = async (template_type: string) => {
  const emailTemplate = await EmailTemplateRepository.getByTemplateType(template_type)

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  return emailTemplate
}

export const getRatingTemplates = async () => {
  return await EmailTemplateRepository.getRatingTemplates()
}
