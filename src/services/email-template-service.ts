import * as EmailTemplateRepository from "../repositories/email-template-repository"

export const getDefault = async () => {
  return await EmailTemplateRepository.getDefault()
}
