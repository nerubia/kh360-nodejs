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
 * @param req.query.is_active - Filter by is active.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, category_id, client_id, global, is_active, page } = req.query
    const results = await OfferingService.getAllByFilters(
      name as string,
      parseInt(category_id as string),
      parseInt(client_id as string),
      Boolean(parseInt(global as string)),
      is_active as string,
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
 * @param req.body.is_active - Is active.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { name, client_id, offering_category_id, currency_id, price, description, is_active } =
      req.body

    const parsedData = await createOfferingSchema.validate({
      name,
      client_id,
      offering_category_id,
      currency_id,
      price,
      description,
      is_active,
    })

    const newOffering = await OfferingService.create({
      name,
      client_id: parsedData.client_id,
      offering_category_id: parsedData.offering_category_id,
      currency_id: parsedData.currency_id,
      price: parsedData.price,
      description,
      is_active: parsedData.is_active,
    })

    res.json(newOffering)
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

/**
 * Get a specific offering by ID.
 * @param req.params.id - Offering id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const offering = await OfferingService.getById(parseInt(id))
    res.json(offering)
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

/**
 * Update an existing offering.
 * @param req.params.id - The ID of the offering to be updated
 * @param req.body.name - Name.
 * @param req.body.client_id - Client id.
 * @param req.body.offering_category_id - Offering category id.
 * @param req.body.currency_id - Currency id.
 * @param req.body.price - Price.
 * @param req.body.description - Description.
 * @param req.body.is_active - Is active.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, client_id, offering_category_id, currency_id, price, description, is_active } =
      req.body

    const parsedData = await createOfferingSchema.validate({
      name,
      client_id,
      offering_category_id,
      currency_id,
      price,
      description,
      is_active,
    })

    const updatedOffering = await OfferingService.updateById(parseInt(id), {
      name,
      client_id: parsedData.client_id,
      offering_category_id: parsedData.offering_category_id,
      currency_id: parsedData.currency_id,
      price: parsedData.price,
      description,
      is_active: parsedData.is_active,
    })

    res.json(updatedOffering)
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
