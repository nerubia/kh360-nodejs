import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"

export const getById = async (id: number) => {
  return await EvaluationTemplateRepository.getById(id)
}

export const getActiveTemplates = async () => {
  const evaluationTemplates = await EvaluationTemplateRepository.list(true)
  const final = await Promise.all(
    evaluationTemplates.map(async (template) => {
      const project_role = await ProjectRoleRepository.getById(template.evaluee_role_id ?? 0)
      return {
        ...template,
        project_role,
      }
    })
  )
  return final
}
