import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

/**
 * List evaluation templates based on provided filters.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_result_id, for_evaluation } = req.query

    const where = {
      evaluation_result_id: parseInt(evaluation_result_id as string),
    }

    if (for_evaluation !== undefined) {
      Object.assign(where, {
        for_evaluation: Boolean(for_evaluation),
      })
    }

    const evaluations = await prisma.evaluations.findMany({
      where,
      distinct: ["evaluation_template_id"],
    })

    const evaluationTemplateIds = evaluations.map(
      (evaluation) => evaluation.evaluation_template_id
    )

    const evaluationTemplates = await prisma.evaluation_templates.findMany({
      where: {
        id: {
          in: evaluationTemplateIds as number[],
        },
      },
    })

    res.json(evaluationTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
