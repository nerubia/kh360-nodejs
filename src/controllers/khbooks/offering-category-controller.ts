import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as OfferingCategoryService from "../../services/khbooks/offering-category-service"

/**
 * List offering categories based on provided filters.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { page } = req.query
    const results = await OfferingCategoryService.getAllByFilters(page as string)
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
