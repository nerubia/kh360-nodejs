import { type Request, type Response } from "express"
import * as ExternalUserService from "../../services/external-user-service"
import CustomError from "../../utils/custom-error"

export const loginAsExternalUser = async (req: Request, res: Response) => {
  try {
    const { token, code } = req.body
    const result = await ExternalUserService.login(token, code)
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
