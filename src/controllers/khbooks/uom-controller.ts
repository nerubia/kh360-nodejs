import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as UomService from "../../services/khbooks/uom-service"

/**
 * List uoms based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, page } = req.query
    const results = await UomService.getAllByFilters(name as string, page as string)
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
