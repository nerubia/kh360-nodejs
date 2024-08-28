import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as OfferingService from "../../services/khbooks/offering-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List offerings based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.category_id - Filter by category_id.
 * @param req.query.client_id - Filter by client_id.
 * @param req.query.global - Filter by global.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, category_id, client_id, global, page } = req.query
    const results = await OfferingService.getAllByFilters(
      name as string,
      parseInt(category_id as string),
      parseInt(client_id as string),
      Boolean(parseInt(global as string)),
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete offering
 * @param req.params.id - The ID of the offering to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await OfferingService.deleteById(parseInt(id))
    res.json({ id, message: "Offering successfully deleted" })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
