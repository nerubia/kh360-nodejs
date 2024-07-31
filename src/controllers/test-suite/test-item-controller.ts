import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as TestItemService from "../../services/test-suite/test-item-service"
import { createTestItemSchema } from "../../utils/validation/test-item-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List test items
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
 * @param req.body.httpMethod - Http method.
 * @param req.body.payload - Payload.
 * @param req.body.response - Response.
 * @param req.body.description - Description.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { apiId, httpMethod, payload, response, description } = req.body

    await createTestItemSchema.validate({
      apiId,
      httpMethod,
      payload,
      response,
      description,
    })

    const newTestItem = await TestItemService.create(user, {
      apiId: parseInt(apiId as string),
      httpMethod,
      payload,
      response,
      description,
      status: true,
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
 * Updatte an existing test item.
 * @param req.params.id -The ID of the test item to be updated
 * @param req.body.apiId - Api ID.
 * @param req.body.httpMethod - Http method.
 * @param req.body.payload - Payload.
 * @param req.body.response - Response.
 * @param req.body.description - Description.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params
    const { apiId, httpMethod, payload, response, description } = req.body

    await createTestItemSchema.validate({
      apiId,
      httpMethod,
      payload,
      response,
      description,
    })

    const updatedTestItem = await TestItemService.updateById(user, parseInt(id), {
      apiId: parseInt(apiId as string),
      httpMethod,
      payload,
      response,
      description,
      status: true,
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
 * @param req.params.id -The ID of the test item to be deleted
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
