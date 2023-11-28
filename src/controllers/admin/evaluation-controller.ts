import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationStatus } from "../../types/evaluation-type"
import * as EvaluationService from "../../services/evaluation-service"

/**
 * List evaluations based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.evaluator_id - Filter by evaluator id.
 * @param req.query.evaluation_template_id - Filter by evaluation template id.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const {
      evaluation_administration_id,
      evaluator_id,
      evaluation_template_id,
      evaluation_result_id,
      for_evaluation,
    } = req.query

    const evaluations = await EvaluationService.getEvaluations(
      parseInt(evaluation_administration_id as string),
      parseInt(evaluator_id as string),
      parseInt(evaluation_template_id as string),
      parseInt(evaluation_result_id as string),
      Boolean(for_evaluation)
    )

    res.json(evaluations)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update multiple status and for_evaluation.
 * @param req.body.evaluation_ids - Evaluation IDs
 * @param req.body.for_evaluation - Evaluation for_evaluation.
 */
export const setForEvaluations = async (req: Request, res: Response) => {
  try {
    const { evaluation_ids, for_evaluation } = req.body

    const evaluationIds = evaluation_ids as number[]

    await prisma.evaluations.updateMany({
      where: {
        id: {
          in: evaluationIds,
        },
      },
      data: {
        status: for_evaluation === true ? EvaluationStatus.Draft : EvaluationStatus.Excluded,
        for_evaluation,
        updated_at: new Date(),
      },
    })

    res.json({
      evaluation_ids: evaluationIds,
      for_evaluation,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
