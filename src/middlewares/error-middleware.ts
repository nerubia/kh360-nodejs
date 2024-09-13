import { type NextFunction, type Request, type Response } from "express"
import multer from "multer"
import { ValidationError } from "yup"
import CustomError from "../utils/custom-error"
import logger from "../utils/logger"

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: `File size exceeds ${process.env.MAX_FILE_SIZE_MB} MB limit.` })
    }
  }
  if (error instanceof ValidationError) {
    return res.status(400).json(error)
  }
  if (error instanceof CustomError) {
    return res.status(error.status).json({ message: error.message })
  }
  logger.error(error)
  res.status(500).send("Internal server error")
}
