import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getDefaultEmailTemplate = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await prisma.email_templates.findFirst({
      where: {
        template_type: "Create Evaluation",
        is_default: true,
      },
    })
    res.json(emailTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
