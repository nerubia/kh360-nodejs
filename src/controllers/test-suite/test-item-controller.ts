import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as TestItemService from "../../services/test-suite/test-item-service"
import { createTestItemSchema } from "../../utils/validation/test-item-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List test items based on provided filters.
 * @param req.query.apiId - Filter by api id.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { apiId, name, status, page } = req.query
    const results = await TestItemService.getAllByFilters(
      parseInt(apiId as string),
      name as string,
      parseInt(status as string),
      page as string
    )
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new test item.
 * @param req.body.apiId - Api ID.
 * @param req.body.payload - Payload.
 * @param req.body.response - Response.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { apiId, payload, response, description, status } = req.body

    await createTestItemSchema.validate({
      apiId,
      payload,
      response,
      description,
      status,
    })

    const newTestItem = await TestItemService.create(user, {
      apiId: parseInt(apiId as string),
      payload,
      response,
      description,
      status: Boolean(status),
    })

    res.json(newTestItem)
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
 * Get a specific test item by ID.
 * @param req.params.id - Test item id
 * @returns test item
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const testItem = await TestItemService.getById(parseInt(id))
    res.json(testItem)
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
 * Update an existing test item.
 * @param req.params.id - The ID of the test item to be updated
 * @param req.body.apiId - Api ID.
 * @param req.body.payload - Payload.
 * @param req.body.response - Response.
 * @param req.body.description - Description.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params
    const { apiId, payload, response, description, status } = req.body

    await createTestItemSchema.validate({
      apiId,
      payload,
      response,
      description,
      status,
    })

    const updatedTestItem = await TestItemService.updateById(user, parseInt(id), {
      apiId: parseInt(apiId as string),
      payload,
      response,
      description,
      status: Boolean(status),
    })

    res.json(updatedTestItem)
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
 * Delete test item
 * @param req.params.id - The ID of the test item to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await TestItemService.deleteById(parseInt(id))
    res.json({ id, message: "Test item successfully deleted" })
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
