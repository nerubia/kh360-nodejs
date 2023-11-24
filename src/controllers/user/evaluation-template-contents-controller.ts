import { type Request, type Response } from "express"
import * as EvaluationTemplateContentService from "../../services/evaluation-template-content-service"

/**
 * List evaluation template contents based on provided filters.
 * @param req.query.evaluation_id - Filter by evaluation id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_id } = req.query

    const evaluationTemplateContents =
      await EvaluationTemplateContentService.getEvaluationTemplateContents(
        parseInt(evaluation_id as string)
      )

    res.json(evaluationTemplateContents)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
