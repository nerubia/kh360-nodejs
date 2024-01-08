import { type Prisma } from "@prisma/client"
import * as EvaluationAdministrationRepository from "../repositories/evaluation-administration-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import CustomError from "../utils/custom-error"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"

export const getById = async (id: number) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplateContents =
    await EvaluationTemplateContentRepository.getByEvaluationTemplateId(evaluationTemplate.id)

  return {
    ...evaluationTemplate,
    evaluationTemplateContents,
  }
}

export const getAllByFilters = async (
  evaluation_result_id?: string,
  for_evaluation?: string,
  name?: string,
  display_name?: string,
  template_type?: string,
  evaluator_role_id?: number,
  evaluee_role_id?: number,
  page?: string
) => {
  if (evaluation_result_id !== undefined) {
    const where = {
      evaluation_result_id: parseInt(evaluation_result_id),
    }

    if (for_evaluation !== undefined) {
      Object.assign(where, {
        for_evaluation: Boolean(for_evaluation),
      })
    }

    const evaluations = await EvaluationRepository.getAllDistinctByFilters(where, [
      "evaluation_template_id",
    ])

    const evaluationTemplateIds = evaluations.map((evaluation) => evaluation.evaluation_template_id)

    const evaluationTemplates = await EvaluationTemplateRepository.getAllByFilters({
      id: {
        in: evaluationTemplateIds as number[],
      },
    })

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

  const itemsPerPage = 20
  const parsedPage = parseInt(page as string)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.evaluation_templatesWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (display_name !== undefined) {
    Object.assign(where, {
      display_name: {
        contains: display_name,
      },
    })
  }

  if (template_type !== undefined && template_type !== "all") {
    Object.assign(where, {
      template_type,
    })
  }

  if (evaluator_role_id !== undefined && !isNaN(evaluator_role_id)) {
    Object.assign(where, {
      evaluator_role_id,
    })
  }

  if (evaluee_role_id !== undefined && !isNaN(evaluee_role_id)) {
    Object.assign(where, {
      evaluee_role_id,
    })
  }

  const totalItems = await EvaluationTemplateRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const evaluationTemplates = await EvaluationTemplateRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: evaluationTemplates,
    pageInfo,
  }
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

export const getTemplateTypes = async () => {
  return await EvaluationTemplateRepository.getAllDistinctByFilters({}, ["template_type"])
}

export const create = async (data: Prisma.evaluation_templatesCreateInput) => {
  return await EvaluationTemplateRepository.create(data)
}

export const updateById = async (id: number, data: Prisma.evaluation_templatesUpdateInput) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  return await EvaluationTemplateRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluations = await EvaluationRepository.getAllDistinctByFilters(
    {
      evaluation_template_id: evaluationTemplate.id,
    },
    ["evaluation_administration_id"]
  )

  const evaluationAdministrationIds = evaluations.map(
    (evaluation) => evaluation.evaluation_administration_id
  )

  const totalItems = await EvaluationAdministrationRepository.countAllByFilters({
    id: {
      in: evaluationAdministrationIds as number[],
    },
    status: {
      notIn: [EvaluationAdministrationStatus.Draft, EvaluationAdministrationStatus.Cancelled],
    },
  })

  if (totalItems > 0) {
    await EvaluationTemplateContentRepository.softDeleteByEvaluationTemplateId(
      evaluationTemplate.id
    )
    await EvaluationTemplateRepository.softDeleteById(evaluationTemplate.id)
  } else {
    await EvaluationTemplateContentRepository.deleteByEvaluationTemplateId(evaluationTemplate.id)
    await EvaluationRepository.deleteByEvaluationAdministrationIds(
      evaluationAdministrationIds as number[]
    )
    await EvaluationRatingRepository.deleteByEvaluationAdministrationIds(
      evaluationAdministrationIds as number[]
    )
    await EvaluationResultDetailRepository.deleteByEvaluationAdministrationIds(
      evaluationAdministrationIds as number[]
    )
    await EvaluationTemplateRepository.deleteById(evaluationTemplate.id)
  }
}
