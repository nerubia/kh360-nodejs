import { type Request, type Response } from "express"
import * as AnswerOptionService from "../../services/answer-option-service"
import CustomError from "../../utils/custom-error"

/**
 * Get active answer options by answer name
 *
 */
export const active = async (req: Request, res: Response) => {
  try {
    const { answer_name } = req.query

    const activeAnswerOptions = await AnswerOptionService.getAllByAnswerName(answer_name as string)

    res.json(activeAnswerOptions)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
