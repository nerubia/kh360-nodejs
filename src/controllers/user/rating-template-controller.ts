import { type Request, type Response } from "express"

import * as EmailTemplateService from "../../services/email-template-service"

export const getRatingTemplates = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplateService.getRatingTemplates()
    res.json(emailTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
