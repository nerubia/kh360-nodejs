import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // TODO: validate inputs

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    })

    if (existingUser === null)
      return res.status(400).json({ message: "Invalid credentials" })

    // TODO: validate password

    // TODO: access token
    const accessToken = "sample access token"

    res.json({
      accessToken,
      user: {
        email,
        firstName: existingUser?.first_name,
        lastName: existingUser?.last_name,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
