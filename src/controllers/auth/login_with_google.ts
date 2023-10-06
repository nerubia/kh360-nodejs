import { type Request, type Response } from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import ms from "ms"
import prisma from "../../utils/prisma"

const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID)

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body

    const loginTicket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    })

    const payload = loginTicket.getPayload()

    if (payload === undefined)
      return res.status(400).json({ message: "Invalid credentials" })

    const existingUser = await prisma.users.findUnique({
      where: {
        email: payload.email,
      },
    })

    if (existingUser === null)
      return res.status(400).json({ message: "Invalid credentials" })

    const accessToken = jwt.sign(
      {
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      }
    )

    const refreshToken = jwt.sign(
      {
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      }
    )

    res.cookie("jwt", refreshToken, {
      httpOnly: true, // accessible by web server only
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION as string),
      secure: true, // Set to true if using HTTPS
      sameSite: "none", // Set to 'none' if using cross-site requests
    })

    res.json({
      accessToken,
      user: {
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
