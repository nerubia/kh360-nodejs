import { type Prisma } from "@prisma/client"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import * as EvaluationRatingRepository from "../repositories/evaluation-rating-repository"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as ScoreRatingRepository from "../repositories/score-rating-repository"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"
import { EvaluationStatus } from "../types/evaluation-type"
import { getBanding } from "../utils/calculate-norms"
import { AnswerType } from "../types/answer-type"
import CustomError from "../utils/custom-error"

export const getAllByFilters = async (where: Prisma.evaluation_result_detailsWhereInput) => {
  return await EvaluationResultDetailRepository.getAllByFilters(where)
}

export const updateById = async (id: number, data: EvaluationResultDetail) => {
  await EvaluationResultDetailRepository.updateById(id, data)
}

export const aggregateSumByEvaluationResultId = async (
  evaluation_result_id: number,
  _sum: Prisma.Evaluation_result_detailsSumAggregateInputType
) => {
  return await EvaluationResultDetailRepository.aggregateSumByEvaluationResultId(
    evaluation_result_id,
    _sum
  )
}

export const calculateScore = async (evaluation_result_id: number) => {
  const currentDate = new Date()
  const evaluationResultDetails = await EvaluationResultDetailRepository.getAllByFilters({
    evaluation_result_id,
  })
  for (const evaluationResultDetail of evaluationResultDetails) {
    const allAnswerTypes = []
    const evaluations = await EvaluationRepository.getAllByFilters({
      evaluation_result_id,
      evaluation_template_id: evaluationResultDetail.evaluation_template_id,
      status: EvaluationStatus.Submitted,
    })

    for (const evaluation of evaluations) {
      const evaluationRatings = await EvaluationRatingRepository.getAllByFilters({
        evaluation_id: evaluation.id,
      })
      const answerOptionIds = evaluationRatings
        .map((answer) => answer.answer_option_id)
        .filter((id) => id !== null)
      const answerOptions = await AnswerOptionRepository.getAllByFilters({
        id: {
          in: answerOptionIds,
        },
      })
      const answerTypes = answerOptions.map((answerOption) => answerOption.answer_type)
      allAnswerTypes.push(...answerTypes)
    }

    const isAllNa =
      allAnswerTypes.length > 0 ? allAnswerTypes.every((answer) => answer === AnswerType.NA) : false

    if (isAllNa || evaluations.length === 0) {
      await EvaluationResultDetailRepository.updateWeightById(evaluationResultDetail.id, 0)
    }

    const evaluationsSum = await EvaluationRepository.aggregateSumByFilters(
      {
        weight: true,
        weighted_score: true,
      },
      {
        evaluation_result_id,
        evaluation_template_id: evaluationResultDetail.evaluation_template_id,
        status: EvaluationStatus.Submitted,
      }
    )

    const calculated_score =
      Math.round(Number(evaluationsSum._sum.weighted_score) * 10000) /
      Math.round(Number(evaluationsSum._sum.weight) * 10000)

    const score = isNaN(calculated_score) ? 0 : Math.round(calculated_score * 10000) / 10000

    await EvaluationResultDetailRepository.updateById(evaluationResultDetail.id, {
      score,
      weighted_score: Number(evaluationResultDetail.weight) * score,
      updated_at: currentDate,
    })
  }
}

export const calculateZscore = async (evaluation_result_id: number) => {
  const evaluationResultDetails = await EvaluationResultDetailRepository.getAllByFilters({
    evaluation_result_id,
  })
  for (const evaluationResultDetail of evaluationResultDetails) {
    const evaluations = await EvaluationRepository.aggregateSumByFilters(
      {
        weight: true,
        weighted_zscore: true,
      },
      {
        evaluation_result_id,
        evaluation_template_id: evaluationResultDetail.evaluation_template_id,
        status: EvaluationStatus.Submitted,
      }
    )

    let zscore = 0
    let weighted_zscore = 0

    if (Number(evaluationResultDetail.weight) !== 0) {
      zscore = Number(evaluations._sum.weighted_zscore) / Number(evaluations._sum.weight)
      weighted_zscore = Number(evaluationResultDetail.weight) * zscore
    }

    await EvaluationResultDetailRepository.updateZScoreById(
      evaluationResultDetail.id,
      zscore,
      weighted_zscore
    )

    const evalResultDetail = await EvaluationResultDetailRepository.getById(
      evaluationResultDetail.id
    )

    if (evalResultDetail !== null) {
      let banding = ""
      if (Number(evaluationResultDetail.weight) !== 0) {
        banding = getBanding(Number(evalResultDetail.zscore))
      }
      await EvaluationResultDetailRepository.updateBandingById(evalResultDetail?.id, banding)
    }
  }
}

export const calculateScoreRating = async (evaluation_result_id: number) => {
  const evaluationResultDetails = await EvaluationResultDetailRepository.getAllByFilters({
    evaluation_result_id,
  })
  for (const evaluationResultDetail of evaluationResultDetails) {
    const score = evaluationResultDetail.score

    if (score === null) {
      throw new CustomError("Invalid evaluation result detail score", 400)
    }

    const scoreRating = await ScoreRatingRepository.getByScore(score)

    if (scoreRating === null) {
      throw new CustomError("Score rating not found", 400)
    }

    await EvaluationResultDetailRepository.updateScoreRatingById(
      evaluationResultDetail.id,
      Number(evaluationResultDetail.weight) !== 0 ? scoreRating.id : null
    )
  }
}
