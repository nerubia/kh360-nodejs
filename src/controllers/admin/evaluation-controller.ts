import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationStatus } from "../../types/evaluation-type"

/**
 * List evaluations based on provided filters.
 * @param req.query.evaluation_template_id - Filter by evaluation template id.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_template_id, evaluation_result_id, for_evaluation } = req.query

    const where = {
      evaluation_template_id: parseInt(evaluation_template_id as string),
      evaluation_result_id: parseInt(evaluation_result_id as string),
    }

    if (for_evaluation !== undefined) {
      Object.assign(where, {
        for_evaluation: Boolean(for_evaluation),
      })
    }

    const evaluations = await prisma.evaluations.findMany({
      include: {
        project_members: {
          select: {
            project_role_id: true,
          },
        },
      },
      where,
    })

    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator =
          evaluation.is_external === true
            ? await prisma.external_users.findUnique({
                select: {
                  id: true,
                  email: true,
                  first_name: true,
                  last_name: true,
                  role: true,
                },
                where: {
                  id: evaluation.external_evaluator_id ?? 0,
                },
              })
            : await prisma.users.findUnique({
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
                where: {
                  id: evaluation.evaluator_id ?? 0,
                },
              })
        const evaluee = await prisma.users.findUnique({
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
          where: {
            id: evaluation.evaluee_id ?? 0,
          },
        })
        const project = await prisma.projects.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_id ?? 0,
          },
        })
        const projectRole = await prisma.project_roles.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_members?.project_role_id ?? 0,
          },
        })
        return {
          id: evaluation.id,
          eval_start_date: evaluation.eval_start_date,
          eval_end_date: evaluation.eval_end_date,
          percent_involvement: evaluation.percent_involvement,
          status: evaluation.status,
          for_evaluation: evaluation.for_evaluation,
          is_external: evaluation.is_external,
          evaluator,
          evaluee,
          project,
          project_role: projectRole,
        }
      })
    )

    res.json(finalEvaluations)
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
