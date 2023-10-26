import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

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
    })

    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator = await prisma.users.findUnique({
          select: {
            first_name: true,
            last_name: true,
          },
          where: {
            id: evaluation.evaluator_id ?? undefined,
          },
        })
        const project = await prisma.projects.findUnique({
          select: {
            name: true,
          },
          where: {
            id: evaluation.project_id ?? undefined,
          },
        })
        const projectRole = await prisma.project_roles.findUnique({
          select: {
            name: true,
          },
          where: {
            id: evaluation.project_members?.project_role_id ?? undefined,
          },
        })
        return {
          id: evaluation.id,
          percent_involvement: evaluation.percent_involvement,
          eval_start_date: evaluation.eval_start_date,
          eval_end_date: evaluation.eval_end_date,
          evaluator,
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
