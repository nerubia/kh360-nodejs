import { type Request, type Response } from "express"
import logger from "../../utils/logger"
import * as TestBatchService from "../../services/test-suite/test-batch-service"
import { createTestBatchSchema } from "../../utils/validation/test-batch-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List test batches based on provided filters.
 * @param req.query.apiId - Filter by api id.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { apiId, name, status, page } = req.query
    const results = await TestBatchService.getAllByFilters(
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
 * Store a new test batch.
 * @param req.body.apiId - Api ID.
 * @param req.body.name - Name.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { apiId, name, description, status, itemIds } = req.body

    await createTestBatchSchema.validate({
      apiId,
      name,
      description,
      status,
      itemIds,
    })

    const newTestBatch = await TestBatchService.create(user, {
      apiId: parseInt(apiId as string),
      name,
      description,
      status: Boolean(status),
      itemIds,
    })

    res.json(newTestBatch)
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
 * Get a specific test batch by ID.
 * @param req.params.id - Test batch id
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const testBatch = await TestBatchService.getById(parseInt(id))
    res.json(testBatch)
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
 * Update an existing test batch.
 * @param req.params.id - The ID of the test batch to be updated
 * @param req.body.apiId - Api ID.
 * @param req.body.name - Name.
 * @param req.body.description - Description.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params
    const { apiId, name, description, status, itemIds } = req.body

    await createTestBatchSchema.validate({
      apiId,
      name,
      description,
      status,
      itemIds,
    })

    const updatedTestBatch = await TestBatchService.updateById(user, parseInt(id), {
      apiId: parseInt(apiId as string),
      name,
      description,
      status: Boolean(status),
      itemIds,
    })

    res.json(updatedTestBatch)
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
 * Delete test batch
 * @param req.params.id - The ID of the test batch to be deleted
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await TestBatchService.deleteById(parseInt(id))
    res.json({ id, message: "Test batch successfully deleted" })
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
