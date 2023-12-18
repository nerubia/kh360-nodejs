import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import * as UserRepository from "../repositories/user-repository"
import CustomError from "../utils/custom-error"
import { type ProjectMember } from "../types/project-member-type"

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
  role: string,
  user_id: number,
  overlap: boolean
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

  const startDate = new Date(start_date)
  const endDate = new Date(end_date)

  const filter = {
    user_id,
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

  if (overlap) {
    Object.assign(filter, {
      OR: [
        {
          start_date: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          end_date: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          start_date: {
            lte: startDate,
          },
          end_date: {
            gte: startDate,
          },
        },
        {
          start_date: {
            lte: endDate,
          },
          end_date: {
            gte: endDate,
          },
        },
      ],
    })
  } else {
    Object.assign(filter, {
      start_date: startDate,
      end_date: endDate,
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

export const create = async (data: ProjectMember) => {
  const project = await ProjectRepository.getById(data.project_id ?? 0)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const user = await UserRepository.getById(data.user_id ?? 0)

  if (user === null) {
    throw new CustomError("User not found", 400)
  }

  const projectRole = await ProjectRoleRepository.getById(data.project_role_id ?? 0)

  if (projectRole === null) {
    throw new CustomError("Project role not found", 400)
  }

  return await ProjectMemberRepository.create(data)
}

export const getById = async (id: number) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  const user = await UserRepository.getById(projectMember.user_id ?? 0)
  const project = await ProjectRepository.getById(projectMember.project_id ?? 0)

  return {
    ...projectMember,
    user,
    project,
  }
}

export const update = async (id: number, data: ProjectMember) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  const project = await ProjectRepository.getById(data.project_id ?? 0)

  if (project === null) {
    throw new CustomError("Project not found", 400)
  }

  const user = await UserRepository.getById(data.user_id ?? 0)

  if (user === null) {
    throw new CustomError("User not found", 400)
  }

  const projectRole = await ProjectRoleRepository.getById(data.project_role_id ?? 0)

  if (projectRole === null) {
    throw new CustomError("Project role not found", 400)
  }

  return await ProjectMemberRepository.update(id, data)
}

export const deleteById = async (id: number) => {
  const projectMember = await ProjectMemberRepository.getById(id)

  if (projectMember === null) {
    throw new CustomError("Project member not found", 400)
  }

  await ProjectMemberRepository.deleteById(id)
}
