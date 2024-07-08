import { type Request, type Response } from "express"
import * as ClientService from "../../services/client-service"
import logger from "../../utils/logger"

/**
 * List active
 */
export const active = async (req: Request, res: Response) => {
  try {
    const activeClients = await ClientService.getActiveClients()
    res.json(activeClients)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
