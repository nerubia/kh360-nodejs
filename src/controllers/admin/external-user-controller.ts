import { type Request, type Response } from "express"
import { ValidationError } from "yup"
import { createExternalUserSchema } from "../../utils/validation/external-user-schema"
import * as ExternalUserService from "../../services/external-user-service"

/**
 * List external users based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.company - Filter by company.
 * @param req.query.role - Filter by role.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, company, role, page } = req.query

    const evaluatorRole = role === "all" ? "" : role

    const itemsPerPage = 10
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where = {
      role: {
        contains: evaluatorRole as string,
      },
      company: {
        contains: company as string,
      },
    }

    if (name !== undefined) {
      Object.assign(where, {
        OR: [
          {
            first_name: {
              contains: name as string,
            },
          },
          {
            last_name: {
              contains: name as string,
            },
          },
        ],
      })
    }

    const externalUsers = await ExternalUserService.getAllByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      where
    )

    const totalItems = await ExternalUserService.countByFilters(where)
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: externalUsers,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalPages,
        totalItems,
      },
    })
  } catch (error) {
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
    const { email, first_name, middle_name, last_name, role, company } = req.body

    await createExternalUserSchema.validate({
      email,
      first_name,
      middle_name,
      last_name,
      role,
      company,
    })

    const currentDate = new Date()

    const newExternalUser = await ExternalUserService.create({
      email,
      first_name,
      middle_name,
      last_name,
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

    const { email, first_name, middle_name, last_name, role, company } = req.body

    await createExternalUserSchema.validate({
      email,
      first_name,
      middle_name,
      last_name,
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
    res.status(500).json({ message: "Something went wrong" })
  }
}
