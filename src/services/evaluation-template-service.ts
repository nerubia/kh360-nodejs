import { type Prisma } from "@prisma/client"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationResultRepository from "../repositories/evaluation-result-repository"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as EvaluationTemplateContentService from "../services/evaluation-template-content-service"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as ProjectRoleRepository from "../repositories/project-role-repository"
import * as AnswerRepository from "../repositories/answer-repository"
import CustomError from "../utils/custom-error"
import { EvaluationStatus } from "../types/evaluation-type"
import { type EvaluationTemplateContent } from "../types/evaluation-template-content-type"

export const getById = async (id: number) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluatorRole = await ProjectRoleRepository.getById(
    evaluationTemplate.evaluator_role_id ?? 0
  )

  if (evaluatorRole === null) {
    throw new CustomError("Evaluator role not found", 400)
  }

  const evalueeRole = await ProjectRoleRepository.getById(evaluationTemplate.evaluee_role_id ?? 0)

  if (evalueeRole === null) {
    throw new CustomError("Evaluee role not found", 400)
  }

  const answer = await AnswerRepository.getById(evaluationTemplate.answer_id ?? 0)

  Object.assign(evaluationTemplate, {
    evaluatorRole,
    evalueeRole,
    answer,
  })

  const evaluationTemplateContents =
    await EvaluationTemplateContentRepository.getByEvaluationTemplateId(evaluationTemplate.id)

  return {
    ...evaluationTemplate,
    evaluationTemplateContents: evaluationTemplateContents.filter(
      (content) => content.deleted_at === null
    ),
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
      deleted_at: null,
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

  const where: Prisma.evaluation_templatesWhereInput = { deleted_at: null }

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

  const finalEvaluationTemplates = await Promise.all(
    evaluationTemplates.map(async (template) => {
      const evaluatorRole = await ProjectRoleRepository.getById(template.evaluator_role_id ?? 0)
      const evalueeRole = await ProjectRoleRepository.getById(template.evaluee_role_id ?? 0)
      return {
        ...template,
        evaluatorRole,
        evalueeRole,
      }
    })
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: finalEvaluationTemplates.filter((template) => template.deleted_at === null),
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
  return await EvaluationTemplateRepository.getAllDistinctByFilters({ deleted_at: null }, [
    "template_type",
  ])
}

export const create = async (
  data: Prisma.evaluation_templatesCreateInput,
  evaluationTemplateContents: Prisma.evaluation_template_contentsCreateInput[]
) => {
  const evaluationTemplate = await EvaluationTemplateRepository.create(data)
  const currentDate = new Date()

  await EvaluationTemplateContentRepository.createMany(
    evaluationTemplateContents.map((content) => ({
      ...content,
      evaluation_template_id: evaluationTemplate.id,
      created_at: currentDate,
      updated_at: currentDate,
    }))
  )

  return evaluationTemplate
}

export const updateById = async (
  id: number,
  data: Prisma.evaluation_templatesUpdateInput,
  evaluationTemplateContents: EvaluationTemplateContent[]
) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplateContentIds = evaluationTemplateContents.map((content) => content.id)
  const existingEvaluationTemplateContents =
    await EvaluationTemplateContentRepository.getByEvaluationTemplateId(evaluationTemplate.id)
  const existingEvaluationTemplateContentIds = existingEvaluationTemplateContents.map(
    (content) => content.id
  )

  for (const evaluationTemplateContent of evaluationTemplateContents) {
    const existingEvaluationTemplateContent = await EvaluationTemplateContentRepository.getById(
      evaluationTemplateContent.id ?? 0
    )
    if (existingEvaluationTemplateContent !== null) {
      await EvaluationTemplateContentRepository.updateById(
        evaluationTemplateContent.id,
        evaluationTemplateContent
      )
    } else {
      await EvaluationTemplateContentRepository.create(evaluationTemplate.id, {
        name: evaluationTemplateContent.name,
        description: evaluationTemplateContent.description,
        category: evaluationTemplateContent.category,
        rate: evaluationTemplateContent.rate,
        is_active: evaluationTemplateContent.is_active,
        sequence_no: evaluationTemplateContent.sequence_no,
      })
    }
  }

  const deletedTemplateContentIds = existingEvaluationTemplateContentIds.filter(
    (id) => !evaluationTemplateContentIds.includes(id)
  )

  for (const deletedTemplateContentId of deletedTemplateContentIds) {
    await EvaluationTemplateContentService.deleteById(deletedTemplateContentId)
  }

  const updatedEvaluationTemplate = await EvaluationTemplateRepository.updateById(id, data)
  return updatedEvaluationTemplate
}

export const deleteById = async (id: number) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(id)

  if (evaluationTemplate === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluations = await EvaluationRepository.getAllByFilters({
    evaluation_template_id: evaluationTemplate.id,
  })

  const activeEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.status !== EvaluationStatus.Draft &&
      evaluation.status !== EvaluationStatus.Excluded &&
      evaluation.status !== EvaluationStatus.Pending &&
      evaluation.status !== EvaluationStatus.Open
  )

  if (activeEvaluations.length > 0) {
    throw new CustomError("Template is currently being used. You are not allowed to delete.", 400)
  }

  const forSoftDeleteEvaluationIds = evaluations
    .filter((evaluation) => evaluation.status === EvaluationStatus.Open)
    .map((evaluation) => evaluation.id)
  const forHardDeleteEvaluationIds = evaluations
    .filter(
      (evaluation) =>
        evaluation.status === EvaluationStatus.Draft ||
        evaluation.status === EvaluationStatus.Excluded ||
        evaluation.status === EvaluationStatus.Pending
    )
    .map((evaluation) => evaluation.id)

  await EvaluationRepository.softDeleteByEvaluationIds(forSoftDeleteEvaluationIds)
  await EvaluationRatingRepository.softDeleteByEvaluationIds(forSoftDeleteEvaluationIds)
  await EvaluationRepository.deleteByEvaluationIds(forHardDeleteEvaluationIds)
  await EvaluationRatingRepository.deleteByEvaluationIds(forHardDeleteEvaluationIds)

  if (forSoftDeleteEvaluationIds.length > 0) {
    await EvaluationTemplateContentRepository.softDeleteByEvaluationTemplateId(
      evaluationTemplate.id
    )
    await EvaluationTemplateRepository.softDeleteById(evaluationTemplate.id)
  } else {
    await EvaluationTemplateContentRepository.deleteByEvaluationTemplateId(evaluationTemplate.id)
    await EvaluationTemplateRepository.deleteById(evaluationTemplate.id)
  }

  for (const evaluation of evaluations) {
    const evaluationsCount = await EvaluationRepository.countAllByFilters({
      evaluation_result_id: evaluation.evaluation_result_id,
      deleted_at: null,
      for_evaluation: true,
    })

    if (evaluationsCount === 0) {
      if (evaluation.status === EvaluationStatus.Open) {
        await EvaluationResultRepository.softDeleteById(evaluation.evaluation_result_id ?? 0)
        await EvaluationResultDetailRepository.softDeleteByEvaluationResultId(
          evaluation.evaluation_result_id ?? 0
        )
      } else {
        await EvaluationResultRepository.deleteById(evaluation.evaluation_result_id ?? 0)
        await EvaluationResultDetailRepository.deleteByEvaluationResultId(
          evaluation.evaluation_result_id ?? 0
        )
      }
    }
  }
}
