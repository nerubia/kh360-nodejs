import { type Prisma } from "@prisma/client"
import * as EvaluationResultDetailRepository from "../repositories/evaluation-result-detail-repository"
import * as EvaluationRepository from "../repositories/evaluation-repository"
import { type EvaluationResultDetail } from "../types/evaluation-result-detail-type"
import { EvaluationStatus } from "../types/evaluation-type"
import { getBanding } from "../utils/calculate-norms"

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
    const evaluations = await EvaluationRepository.aggregateSumByFilters(
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

    const score = Number(evaluations._sum.weighted_score) / Number(evaluations._sum.weight)

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

    const zscore = Number(evaluations._sum.weighted_zscore) / Number(evaluations._sum.weight)

    await EvaluationResultDetailRepository.updateZScoreById(
      evaluationResultDetail.id,
      zscore,
      Number(evaluationResultDetail.weight) * zscore,
      getBanding(zscore)
    )
  }
}
