import { type Request, type Response } from "express"
import * as EvaluationTemplateContentService from "../../services/evaluation-template-content-service"
import CustomError from "../../utils/custom-error"
import logger from "../../utils/logger"

/**
 * List evaluation template contents based on provided filters.
 * @param req.query.evaluation_id - Filter by evaluation id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_id } = req.query

    const evaluationTemplateContents =
      await EvaluationTemplateContentService.getEvaluationTemplateContents(
        user,
        parseInt(evaluation_id as string)
      )

    res.json(evaluationTemplateContents)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
