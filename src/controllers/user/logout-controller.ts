import { type Request, type Response } from "express"
import logger from "../../utils/logger"

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "none", {
      httpOnly: true, // accessible by web server only
      maxAge: 0,
      secure: true, // Set to true if using HTTPS
      sameSite: "none", // Set to 'none' if using cross-site requests
    })
    res.json({
      message: "Logged out successfully",
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
