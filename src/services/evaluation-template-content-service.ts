import * as EvaluationTemplateContentRepository from "../repositories/evaluation-template-content-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationTemplateRepository from "../repositories/evaluation-template-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import { type Prisma } from "@prisma/client"
import { type UserToken } from "../types/user-token-type"
import CustomError from "../utils/custom-error"

export const getById = async (id: number) => {
  return await EvaluationTemplateContentRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.evaluation_template_contentsWhereInput) => {
  return await EvaluationTemplateContentRepository.getAllByFilters(where)
}

export const getEvaluationTemplateContents = async (user: UserToken, evaluation_id: number) => {
  const evaluation = await EvaluationRepository.getByFilters({
    id: evaluation_id,
    evaluator_id: user.id,
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
      }
    })
  )

  return finalEvaluationTemplateContents
}
