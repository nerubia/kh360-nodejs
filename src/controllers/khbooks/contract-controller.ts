import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as ContractService from "../../services/khbooks/contract-service"

/**
 * List contracts based on provided filters.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.active - Filter by active.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { client_id, active, page } = req.query
    const results = await ContractService.getAllByFilters(
      parseInt(client_id as string),
      Boolean(parseInt(active as string)),
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
