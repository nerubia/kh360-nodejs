import { type Request, type Response } from "express"
import * as AnswerService from "../../services/answer-service"
import logger from "../../utils/logger"

/**
 * List active
 */
export const active = async (req: Request, res: Response) => {
  try {
    const activeAnswers = await AnswerService.gettActiveAnswers()
    res.json(activeAnswers)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
