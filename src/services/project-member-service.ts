import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as UserRepository from "../repositories/user-repository"
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

  const existingEvaluation = await EvaluationRepository.getByFilters({
    evaluation_administration_id: evaluationAdministration.id,
    evaluation_result_id: evaluationResult.id,
    evaluation_template_id: evaluationTemplate.id,
  })

  const projectMembers = await ProjectMemberRepository.getAllByFilters({
    user_id: evaluationResult.user_id,
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
      {
        start_date: { lte: evaluationAdministration.eval_period_start_date ?? new Date() },
        end_date: { gte: evaluationAdministration.eval_period_end_date ?? new Date() },
      },
      {
        start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
        end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
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

  return existingEvaluation?.project_id === null ? [] : finalProjects
}

export const getAllByFilters = async (
  start_date: string,
  end_date: string,
  name: string,
  project_name: string,
  role: string
) => {
  let userIds: number[] = []
  let projectIds: number[] = []

  if (name !== undefined) {
    const users = await UserRepository.getAllByFilters({
      OR: [
        {
          first_name: {
            contains: name,
          },
        },
        {
          last_name: {
            contains: name,
          },
        },
      ],
    })
    userIds = users.map((user) => user.id)
  }

  if (project_name !== undefined) {
    const projects = await ProjectRepository.getAllByName(project_name)
    projectIds = projects.map((project) => project.id)
  }

  const filter = {
    start_date,
    end_date,
  }

  if (userIds.length > 0) {
    Object.assign(filter, {
      user_id: {
        in: userIds,
      },
    })
  }

  if (projectIds.length > 0) {
    Object.assign(filter, {
      project_id: {
        in: projectIds,
      },
    })
  }

  if (role !== undefined) {
    Object.assign(filter, {
      project_role_id: parseInt(role),
    })
  }

  const projectMembers = await ProjectMemberRepository.getAllByFilters(filter)

  const finalProjects = await Promise.all(
    projectMembers.map(async (projectMember) => {
      const user = await UserRepository.getById(projectMember.user_id ?? 0)
      const project = await ProjectRepository.getById(projectMember.project_id ?? 0)
      return {
        ...projectMember,
        user,
        project,
      }
    })
  )

  return finalProjects
}
