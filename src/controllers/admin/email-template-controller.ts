import { type Request, type Response } from "express"

import * as EmailTemplateService from "../../services/email-template-service"

export const getDefaultEmailTemplate = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplateService.getDefault()
    res.json(emailTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
