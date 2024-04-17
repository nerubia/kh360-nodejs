import { type Request, type Response } from "express"

import * as EmailTemplateService from "../../services/email-template-service"
import CustomError from "../../utils/custom-error"
import logger from "../../utils/logger"

export const index = async (req: Request, res: Response) => {
  try {
    const { template_type } = req.query
    const emailTemplate = await EmailTemplateService.getDefaultByTemplateType(
      template_type as string
    )
    res.json(emailTemplate)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
