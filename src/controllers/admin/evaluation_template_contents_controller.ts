import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

/**
 * List evaluation template contents based on provided filters.
 * @param req.query.evaluation_template_id - Filter by evaluation template id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_template_id } = req.query

    const evaluationTemplateContents =
      await prisma.evaluation_template_contents.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: {
          evaluation_template_id: parseInt(evaluation_template_id as string),
        },
      })

    res.json(evaluationTemplateContents)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
