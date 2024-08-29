import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as OfferingService from "../../services/khbooks/offering-service"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"
import { createOfferingSchema } from "../../utils/validation/offering-schema"

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
 * Store a new offering.
 * @param req.body.name - Name.
 * @param req.body.client_id - Client id.
 * @param req.body.offering_category_id - Offering category id.
 * @param req.body.currency_id - Currency id.
 * @param req.body.price - Price.
 * @param req.body.description - Description.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { name, client_id, offering_category_id, currency_id, price, description } = req.body

    await createOfferingSchema.validate({
      name,
      client_id,
      offering_category_id,
      currency_id,
      price,
      description,
    })

    const newOffering = await OfferingService.create({
      name,
      client_id: parseInt(client_id as string),
      offering_category_id: parseInt(offering_category_id as string),
      currency_id: parseInt(currency_id as string),
      price: parseInt(price as string),
      description,
    })

    res.json(newOffering)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(400).json(error)
    }
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
