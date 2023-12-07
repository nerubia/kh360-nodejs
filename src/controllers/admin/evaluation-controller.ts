import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationStatus } from "../../types/evaluation-type"
import * as EvaluationService from "../../services/evaluation-service"
import CustomError from "../../utils/custom-error"

/**
 * List evaluations based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.evaluator_id - Filter by evaluator id.
 * @param req.query.external_evaluator_id - Filter by external evaluator id.
 * @param req.query.evaluation_template_id - Filter by evaluation template id.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const {
      evaluation_administration_id,
      evaluator_id,
      external_evaluator_id,
      evaluation_template_id,
      evaluation_result_id,
      for_evaluation,
    } = req.query

    const evaluations = await EvaluationService.getEvaluations(
      parseInt(evaluation_administration_id as string),
      parseInt(evaluator_id as string),
      parseInt(external_evaluator_id as string),
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
 * Update an existing evaluation by ID.
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.project_id - Project ID.
 * @param req.body.project_member_id - Project member ID.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { project_id, project_member_id } = req.body
    const updateEvaluation = await EvaluationService.updateProjectById(
      parseInt(id),
      parseInt(project_id as string),
      parseInt(project_member_id as string)
    )
    res.json(updateEvaluation)
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

/**
 * Approve an existing evaluation by ID.
 * @param req.params.id - The unique ID of the evaluation.
 */
export const approve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationService.approve(parseInt(id))
    res.json({ id, status: EvaluationStatus.Removed })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Decline an existing evaluation by ID.
 * @param req.params.id - The unique ID of the evaluation.
 */
export const decline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationService.decline(parseInt(id))
    res.json({ id, status: EvaluationStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
