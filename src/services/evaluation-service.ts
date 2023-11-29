import { type Prisma } from "@prisma/client"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ExternalUserRepository from "../repositories/external-user-repository"
import * as UserRepository from "../repositories/user-repository"
import * as ProjectMemberRepository from "../repositories/project-member-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import { EvaluationStatus, type Evaluation } from "../types/evaluation-type"
import { type UserToken } from "../types/user-token-type"
import CustomError from "../utils/custom-error"

export const getById = async (id: number) => {
  return await EvaluationRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.getAllByFilters(where)
}

export const getEvaluations = async (
  user: UserToken,
  evaluation_administration_id: number,
  for_evaluation: boolean
) => {
  const filter = {
    evaluation_administration_id,
    for_evaluation,
    status: {
      in: [EvaluationStatus.Open, EvaluationStatus.Ongoing, EvaluationStatus.Submitted],
    },
  }

  if (user.is_external) {
    Object.assign(filter, {
      external_evaluator_id: user.id,
    })
  } else {
    Object.assign(filter, {
      evaluator_id: user.id,
    })
  }

  const evaluations = await EvaluationRepository.getAllByFilters(filter)

  const finalEvaluations = await Promise.all(
    evaluations.map(async (evaluation) => {
      const evaluator = user.is_external
        ? await ExternalUserRepository.getById(evaluation.external_evaluator_id ?? 0)
        : await UserRepository.getById(evaluation.evaluator_id ?? 0)
      const evaluee = await UserRepository.getById(evaluation.evaluee_id ?? 0)
      const project = await ProjectRepository.getById(evaluation.project_id ?? 0)
      const projectRole = await ProjectRoleRepository.getById(
        evaluation.project_members?.project_role_id ?? 0
      )

      let template = null

      if (project === null) {
        template = await EvaluationTemplateRepository.getById(
          evaluation.evaluation_template_id ?? 0
        )
        if (template?.evaluee_role_id !== null) {
          const project_role = await ProjectRoleRepository.getById(template?.evaluee_role_id ?? 0)
          Object.assign(template ?? 0, {
            project_role,
          })
        }
      }

      return {
        id: evaluation.id,
        comments: evaluation.comments,
        eval_start_date: evaluation.eval_start_date,
        eval_end_date: evaluation.eval_end_date,
        percent_involvement: evaluation.percent_involvement,
        status: evaluation.status,
        for_evaluation: evaluation.for_evaluation,
        evaluator,
        evaluee,
        project,
        project_role: projectRole,
        template,
      }
    })
  )

  return finalEvaluations
}

export const getAllDistinctByFilters = async (
  where: Prisma.evaluationsWhereInput,
  distinct: Prisma.EvaluationsScalarFieldEnum | Prisma.EvaluationsScalarFieldEnum[]
) => {
  return await EvaluationRepository.getAllDistinctByFilters(where, distinct)
}

export const updateProjectById = async (
  id: number,
  project_id: number,
  project_member_id: number
) => {
  const evaluation = await EvaluationRepository.getById(id)

  if (evaluation === null) {
    throw new CustomError("Id not found", 400)
  }

  const project = await ProjectRepository.getById(project_id)

  if (project === null) {
    throw new CustomError("Id not found", 400)
  }

  const projectMember = await ProjectMemberRepository.getById(project_member_id)

  if (projectMember === null) {
    throw new CustomError("Id not found", 400)
  }

  await EvaluationRepository.updateProjectById(evaluation.id, project.id, projectMember.id)

  return {
    id: evaluation.id,
    project,
  }
}

export const updateById = async (id: number, data: Evaluation) => {
  await EvaluationRepository.updateById(id, data)
}

export const updateStatusById = async (id: number, status: string) => {
  await EvaluationRepository.updateStatusById(id, status)
}

export const updateStatusByAdministrationId = async (
  evaluation_administration_id: number,
  status: string
) => {
  await EvaluationRepository.updateStatusByAdministrationId(evaluation_administration_id, status)
}

export const countAllByFilters = async (where: Prisma.evaluationsWhereInput) => {
  return await EvaluationRepository.countAllByFilters(where)
}

export const aggregateSumByFilters = async (
  _sum: Prisma.EvaluationsSumAggregateInputType,
  where: Prisma.evaluationsWhereInput
) => {
  return await EvaluationRepository.aggregateSumByFilters(_sum, where)
}
