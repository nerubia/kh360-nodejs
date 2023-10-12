import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { sendMail } from "../../services/mail_service"

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const userData = await prisma.users.findUnique({
      where: {
        email: user.email,
      },
    })
    res.json({
      userData,
      message: "ok",
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const sendSampleMail = async (req: Request, res: Response) => {
  try {
    const user = req.user
    await sendMail(user.email, "Sample subject", "Hello")
    res.json({
      message: "Mail sent",
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
