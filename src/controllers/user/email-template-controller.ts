import { type Request, type Response } from "express"

import * as EmailTemplateService from "../../services/email-template-service"
import CustomError from "../../utils/custom-error"

export const index = async (req: Request, res: Response) => {
  try {
    const { template_type } = req.query
    const emailTemplate = await EmailTemplateService.getByTemplateType(template_type as string)
    res.json(emailTemplate)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
