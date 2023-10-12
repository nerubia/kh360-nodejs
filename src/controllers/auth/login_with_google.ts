import { type Request, type Response } from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import ms from "ms"
import prisma from "../../utils/prisma"

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  "postmessage"
)

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { code } = req.body

    const tokenResponse = await client.getToken(code)

    if (
      tokenResponse.tokens.id_token === undefined ||
      tokenResponse.tokens.id_token === null
    ) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const loginTicket = await client.verifyIdToken({
      idToken: tokenResponse.tokens.id_token,
    })

    const payload = loginTicket.getPayload()

    if (payload === undefined) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        email: payload.email,
      },
    })

    if (existingUser === null) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const accessToken = jwt.sign(
      {
        id: existingUser.id,
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
        id: existingUser.id,
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

    const userRoles = await prisma.user_roles.findMany({
      where: {
        user_id: existingUser.id,
      },
    })

    res.json({
      accessToken,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.first_name,
        lastName: existingUser.last_name,
        roles: userRoles.map((role) => role.name),
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
