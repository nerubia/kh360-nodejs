import { type Request, type Response } from "express"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import ms from "ms"
import prisma from "../../utils/prisma"
import logger from "../../utils/logger"

const client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  "postmessage"
)

export const loginWithGoogle = async (req: Request, res: Response) => {
  try {
    const { app, code } = req.body

    const tokenResponse = await client.getToken(code)

    if (tokenResponse.tokens.id_token === undefined || tokenResponse.tokens.id_token === null) {
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
      include: {
        user_details: {
          select: {
            user_type: true,
          },
        },
        user_settings: {
          select: {
            id: true,
            name: true,
            setting: true,
          },
        },
      },
    })

    if (existingUser === null) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const userRoles = await prisma.user_roles.findMany({
      where: {
        user_id: existingUser.id,
      },
    })

    const roles = userRoles.map((role) => role.name)

    if (app === "khbooks" && !roles.includes("khbooks")) {
      return res.status(400).json({ message: "Your account does not have the necessary role." })
    }

    const access_token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        roles,
        is_external: false,
        user_details: existingUser.user_details,
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
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
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
      access_token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        picture: existingUser.picture,
        roles,
        user_details: existingUser.user_details,
        user_settings: existingUser.user_settings,
      },
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
