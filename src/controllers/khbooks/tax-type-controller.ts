import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as TaxTypeService from "../../services/khbooks/tax-type-service"

/**
 * List tax types based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, page } = req.query
    const results = await TaxTypeService.getAllByFilters(name as string, page as string)
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
