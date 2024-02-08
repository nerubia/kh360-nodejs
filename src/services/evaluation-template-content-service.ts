import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import { type Prisma } from "@prisma/client"
import { type UserToken } from "../types/user-token-type"
import { EvaluationStatus } from "../types/evaluation-type"
import CustomError from "../utils/custom-error"

export const create = async (
  evaluation_template_id: number,
  data: Prisma.evaluation_template_contentsCreateInput
) => {
  const evaluationTemplate = await EvaluationTemplateRepository.getById(evaluation_template_id)
  if (evaluationTemplate === null) {
    throw new CustomError("Evaluation template not found", 400)
  }

  return await EvaluationTemplateContentRepository.create(evaluationTemplate.id, data)
}

export const getById = async (id: number) => {
  return await EvaluationTemplateContentRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluation_template_contentsWhereInput) => {
  return await EvaluationTemplateContentRepository.getAllByFilters(where)
}

export const getEvaluationTemplateContents = async (user: UserToken, evaluation_id: number) => {
  const evaluation = await EvaluationRepository.getByFilters({
    id: evaluation_id,
    ...(user.is_external ? { external_evaluator_id: user.id } : { evaluator_id: user.id }),
  })

  if (evaluation === null) {
    throw new CustomError("Invalid evaluation id", 400)
  }

  const evaluationTemplateContents = await EvaluationTemplateContentRepository.getAllByFilters({
    evaluation_template_id: evaluation?.evaluation_template_id,
  })

  const finalEvaluationTemplateContents = await Promise.all(
    evaluationTemplateContents.map(async (templateContent) => {
      const answerOptionsType = await EvaluationTemplateRepository.getById(
        evaluation?.evaluation_template_id as number
      )
      const answerOptions = await AnswerOptionRepository.getAllByFilters({
        answer_id: answerOptionsType?.answer_id,
        is_active: true,
      })

      const evaluationRating = await EvaluationRatingRepository.getByFilters({
        evaluation_id: evaluation?.id,
        evaluation_template_content_id: templateContent.id,
      })

      if (
        evaluationRating?.answer_option_id !== null &&
        evaluationRating?.answer_option_id !== undefined
      ) {
        const ratingAnswerOption = await AnswerOptionRepository.getById(
          evaluationRating?.answer_option_id
        )

        Object.assign(evaluationRating as Record<string, unknown>, {
          ratingSequenceNumber: ratingAnswerOption?.sequence_no,
          ratingAnswerType: ratingAnswerOption?.answer_type,
        })
      }

      return {
        id: templateContent.id,
        name: templateContent.name,
        description: templateContent.description,
        eval_start_date: evaluation?.eval_start_date,
        eval_end_date: evaluation?.eval_end_date,
        evaluationRating,
        answerId: answerOptionsType?.answer_id,
        answerOptions,
        deleted_at: templateContent.deleted_at,
      }
    })
  )

  return finalEvaluationTemplateContents.filter((content) => content.deleted_at === null)
}

export const updateById = async (
  id: number,
  data: Prisma.evaluation_template_contentsUpdateInput
) => {
  const evaluationTemplateContent = await EvaluationTemplateContentRepository.getById(id)

  if (evaluationTemplateContent === null) {
    throw new CustomError("Id not found", 400)
  }

  return await EvaluationTemplateContentRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  const evaluationTemplateContent = await EvaluationTemplateContentRepository.getById(id)

  if (evaluationTemplateContent === null) {
    throw new CustomError("Id not found", 400)
  }

  const evaluationTemplate = await EvaluationTemplateRepository.getById(
    evaluationTemplateContent.evaluation_template_id ?? 0
  )

  if (evaluationTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  const evaluationTemplateContentCount =
    await EvaluationTemplateContentRepository.countAllByFilters({
      evaluation_template_id: evaluationTemplate.id,
    })

  if (evaluationTemplateContentCount === 1) {
    throw new CustomError(
      "You are no longer allowed to delete an evaluation template content.",
      400
    )
  }

  const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
    evaluation_template_content_id: evaluationTemplateContent.id,
  })
  const evaluationIds = evaluationRatings.map((rating) => rating.evaluation_id)

  const totalOngoingEvaluations = await EvaluationRepository.countAllByFilters({
    id: {
      in: evaluationIds as number[],
    },
    status: {
      in: [EvaluationStatus.Ongoing, EvaluationStatus.Open],
    },
  })

  if (totalOngoingEvaluations > 0) {
    throw new CustomError("You are not allowed to delete this content.", 400)
  }

  const totalSubmittedEvaluations = await EvaluationRepository.countAllByFilters({
    id: {
      in: evaluationIds as number[],
    },
    status: {
      in: [EvaluationStatus.Submitted, EvaluationStatus.Reviewed],
    },
  })

  if (totalSubmittedEvaluations > 0) {
    await EvaluationTemplateContentRepository.softDeleteById(evaluationTemplateContent.id)
  } else {
    await EvaluationTemplateContentRepository.deleteById(evaluationTemplateContent.id)
  }
}
