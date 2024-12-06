import { type Request, type Response } from "express"
import * as SystemSettingsService from "../../services/system-settings-service"
import CustomError from "../../utils/custom-error"
import logger from "../../utils/logger"

/**
 * Get a specific system settings by Name.
 * @param req.params.name - Name
 */
export const getByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params
    const systemSettings = await SystemSettingsService.getByName(name)
    res.json(systemSettings)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
