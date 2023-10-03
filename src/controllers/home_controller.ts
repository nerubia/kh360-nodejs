import { Request, Response } from "express"

export const getHome = async (req: Request, res: Response) => {
  try {
    res.send("ok")
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
