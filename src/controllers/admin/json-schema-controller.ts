import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import jsonSchema from "../../json-schema/json-schema.json"
/**
 * Json Schema
 */
export const index = async (req: Request, res: Response) => {
  try {
    return res.json(jsonSchema)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
