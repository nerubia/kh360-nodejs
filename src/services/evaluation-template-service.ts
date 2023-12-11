import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"

export const getById = async (id: number) => {
  return await EvaluationTemplateRepository.getById(id)
}

export const getActiveTemplates = async () => {
  return await EvaluationTemplateRepository.list(true)
}
