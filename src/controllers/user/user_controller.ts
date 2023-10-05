import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const userData = await prisma.users.findUnique({
      where: {
        email: user.email,
      },
    })
    res.json(userData)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
