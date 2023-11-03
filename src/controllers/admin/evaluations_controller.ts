import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationStatus } from "../../types/evaluationType"

/**
 * List evaluations based on provided filters.
 * @param req.query.evaluation_template_id - Filter by evaluation template id.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_template_id, evaluation_result_id } = req.query

    const evaluations = await prisma.evaluations.findMany({
      include: {
        project_members: {
          select: {
            project_role_id: true,
          },
        },
      },
      where: {
        evaluation_template_id: parseInt(evaluation_template_id as string),
        evaluation_result_id: parseInt(evaluation_result_id as string),
      },
      distinct: ["evaluator_id", "project_id"],
    })

    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator = await prisma.users.findUnique({
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
          where: {
            id: evaluation.evaluator_id ?? undefined,
          },
        })
        const project = await prisma.projects.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_id ?? undefined,
          },
        })
        const projectRole = await prisma.project_roles.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_members?.project_role_id ?? undefined,
          },
        })
        return {
          id: evaluation.id,
          eval_start_date: evaluation.eval_start_date,
          eval_end_date: evaluation.eval_end_date,
          percent_involvement: evaluation.percent_involvement,
          evaluator,
          project,
          project_role: projectRole,
          for_evaluation: evaluation.for_evaluation,
        }
      })
    )

    res.json(finalEvaluations)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update for_evaluation by ID
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.for_evaluation - Evaluation for_evaluation.
 */
export const setForEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { for_evaluation } = req.body

    const evaluation = await prisma.evaluations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluation === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    await prisma.evaluations.update({
      where: {
        id: evaluation.id,
      },
      data: {
        status:
          for_evaluation === true
            ? EvaluationStatus.Draft
            : EvaluationStatus.Excluded,
        for_evaluation,
      },
    })

    res.json({ id })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
