import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as TestApiService from "../../services/test-suite/test-api-service"
import { createTestApiSchema } from "../../utils/validation/test-api-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List test apis based on provided filters.
 * @param req.query.id - Filter by api id.
 * @param req.query.name - Filter by name.
 * @param req.query.endpoint - Filter by endpoint.
 * @param req.query.env - Filter by env.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { id, name, endpoint, env, status, page } = req.query
    const results = await TestApiService.getAllByFilters(
      parseInt(id as string),
      name as string,
      endpoint as string,
      env as string,
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
 * Store a new test api.
 * @param req.body.name - Name.
 * @param req.body.endpoint - Endpoint.
 * @param req.body.http_method - Http method.
 * @param req.body.env - Env.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { name, endpoint, http_method, env, description, status } = req.body

    await createTestApiSchema.validate({
      name,
      endpoint,
      http_method,
      env,
      description,
      status,
    })

    const newTestApi = await TestApiService.create(user, {
      name,
      endpoint,
      http_method,
      env,
      description,
      status: Boolean(status),
    })

    res.json(newTestApi)
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
 * Get a specific test api by ID.
 * @param req.params.id - Test api id
 * @returns test api
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const testApi = await TestApiService.getById(parseInt(id))
    res.json(testApi)
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
 * Update an existing test api.
 * @param req.params.id - The ID of the test api to be updated
 * @param req.body.name - Name.
 * @param req.body.endpoint - Endpoint.
 * @param req.body.http_method - Http method.
 * @param req.body.env - Env.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params
    const { name, endpoint, http_method, env, description, status } = req.body

    await createTestApiSchema.validate({
      name,
      endpoint,
      http_method,
      env,
      description,
      status,
    })

    const updatedTestApi = await TestApiService.updateById(user, parseInt(id), {
      name,
      endpoint,
      http_method,
      env,
      description,
      status: Boolean(status),
    })

    res.json(updatedTestApi)
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
 * Delete test api
 * @param req.params.id - The ID of the test api to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await TestApiService.deleteById(parseInt(id))
    res.json({ id, message: "Test api successfully deleted" })
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
