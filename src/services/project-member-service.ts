import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import CustomError from "../utils/custom-error"

export const getProjectMembers = async (
  evaluation_administration_id: number,
  evaluation_result_id: number,
  evaluation_template_id: number
) => {
  const evaluationAdministration = await EvaluationAdministrationRepository.getById(
    evaluation_administration_id
  )

  if (evaluationAdministration === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationResult = await EvaluationResultRepository.getById(evaluation_result_id)

  if (evaluationResult === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(evaluation_template_id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const projectMembers = await ProjectMemberRepository.getAllByFilters({
    user_id: evaluationResult.user_id,
    project_role_id: evaluationTemplate.evaluee_role_id,
    OR: [
      {
        start_date: {
          gte: evaluationAdministration.eval_period_start_date ?? new Date(),
          lte: evaluationAdministration.eval_period_end_date ?? new Date(),
        },
      },
      {
        end_date: {
          gte: evaluationAdministration.eval_period_start_date ?? new Date(),
          lte: evaluationAdministration.eval_period_end_date ?? new Date(),
        },
      },
    ],
  })

  const finalProjects = await Promise.all(
    projectMembers.map(async (projectMember) => {
      const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
      return {
        ...projectMember,
        project,
      }
    })
  )

  return finalProjects
}
