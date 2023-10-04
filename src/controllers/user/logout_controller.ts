import { type Request, type Response } from "express"

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt")
    res.json({
      message: "Logged out successfully",
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
