import { type Request, type Response } from "express"
import { ValidationError } from "yup"
import { createExternalUserSchema } from "../../utils/validation/external-user-schema"
import * as ExternalUserService from "../../services/external-user-service"
import CustomError from "../../utils/custom-error"
import logger from "../../utils/logger"

/**
 * List external users based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.company - Filter by company.
 * @param req.query.role - Filter by role.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, company, userType, role, page } = req.query

    const externalUsers = await ExternalUserService.getAllByFilters(
      name as string,
      company as string,
      userType as string,
      role as string,
      page as string
    )

    res.json(externalUsers)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new external user.
 * @param req.body.email - Email.
 * @param req.body.first_name - First name.
 * @param req.body.middle_name - Middle name.
 * @param req.body.last_name - Last name.
 * @param req.body.role - Role.
 * @param req.body.company - Company.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { email, first_name, middle_name, last_name, user_type, role, company } = req.body

    await createExternalUserSchema.validate({
      email,
      first_name,
      middle_name,
      last_name,
      user_type,
      role,
      company,
    })

    const currentDate = new Date()

    const newExternalUser = await ExternalUserService.create({
      email,
      first_name,
      middle_name,
      last_name,
      user_type,
      role,
      company,
      created_by_id: user.id,
      updated_by_id: user.id,
      created_at: currentDate,
      updated_at: currentDate,
    })

    res.json(newExternalUser)
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
 * Get a specific external user by ID.
 * @param req.params.id - The unique ID of the external user.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const externalUser = await ExternalUserService.getById(parseInt(id))
    res.json(externalUser)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing external user by ID.
 * @param req.params.id - The unique ID of the external user.
 * @param req.body.email - Email.
 * @param req.body.first_name - First name.
 * @param req.body.middle_name - Middle name.
 * @param req.body.last_name - Last name.
 * @param req.body.role - Role.
 * @param req.body.company - Company.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params

    const { email, first_name, middle_name, last_name, user_type, role, company } = req.body

    await createExternalUserSchema.validate({
      email,
      first_name,
      middle_name,
      last_name,
      user_type,
      role,
      company,
    })

    const externalUser = await ExternalUserService.getById(parseInt(id))

    if (externalUser === null) {
      return res.status(400).json({ message: "Invalid id." })
    }

    const currentDate = new Date()

    const updatedExternalUser = await ExternalUserService.updateById(externalUser.id, {
      email,
      first_name,
      middle_name,
      last_name,
      user_type,
      role,
      company,
      updated_by_id: user.id,
      updated_at: currentDate,
    })

    res.json(updatedExternalUser)
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
 * Delete a specific external user by ID.
 * @param req.params.id - The unique ID of the external user.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const externalUser = await ExternalUserService.getById(parseInt(id))

    if (externalUser === null) {
      return res.status(400).json({ message: "Invalid id." })
    }

    await ExternalUserService.deleteById(parseInt(id))

    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
