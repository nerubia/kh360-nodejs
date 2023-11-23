import { type Request, type Response } from "express"
import jwt from "jsonwebtoken"
import ms from "ms"
import * as ExternalUserService from "../../services/external-user-service"
import CustomError from "../../utils/custom-error"

export const loginAsExternalUser = async (req: Request, res: Response) => {
  try {
    const { token, code } = req.body
    const result = await ExternalUserService.login(token, code)

    const refreshToken = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        first_name: result.user.first_name,
        last_name: result.user.last_name,
        is_external: true,
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

    res.json(result)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const resendCode = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    await ExternalUserService.resendCodeByAccessToken(token)
    res.json({ message: "Code has sent successfully" })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const getExternalUserStatus = async (req: Request, res: Response) => {
  try {
    const { token } = req.query
    const result = await ExternalUserService.getLockedAtByAccessToken(token as string)
    res.json({ locked_at: result })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
