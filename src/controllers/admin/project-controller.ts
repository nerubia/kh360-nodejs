import { type Request, type Response } from "express"
import * as ProjectService from "../../services/project-service"
import CustomError from "../../utils/custom-error"
import { createProjectSchema } from "../../utils/validation/project-schema"
import { ValidationError } from "yup"

/**
 * List all projects based on provided filters.
 * @param req.query.name - Filter by name.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const { name } = req.query
    const results = await ProjectService.getAllByFilters(name as string)
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List all statuses.
 */
export const getAllStatus = async (req: Request, res: Response) => {
  try {
    const results = await ProjectService.getAllStatus()
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List projects based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.client - Filter by client.
 * @param req.query.skills - Filter by skills.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Filter by page.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, client, skills, status, page } = req.query
    const results = await ProjectService.paginateByFilters(
      name as string,
      client as string,
      skills as string,
      status as string,
      page as string
    )
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new project.
 * @param req.body.name - Name.
 * @param req.body.client_id - Client id.
 * @param req.body.start_date - Start date.
 * @param req.body.end_date - End date.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 * @param req.body.skill_ids  - Skill IDs.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { name, client_id, start_date, end_date, description, status, skill_ids } = req.body

    await createProjectSchema.validate({
      name,
      client_id,
      start_date,
      end_date,
      description,
      status,
    })

    const newProject = await ProjectService.create(
      {
        name: name as string,
        client_id: parseInt(client_id as string),
        start_date: start_date !== undefined ? new Date(start_date) : null,
        end_date: end_date !== undefined ? new Date(end_date) : null,
        description,
        status,
      },
      skill_ids as string[]
    )

    res.json(newProject)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific project by ID.
 * @param req.params.id - The unique ID of the project.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const project = await ProjectService.getById(parseInt(id))
    res.json(project)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing project by ID.
 * @param req.params.id - The unique ID of the project.
 * @param req.body.name - Name.
 * @param req.body.client_id - Client id.
 * @param req.body.start_date - Start date.
 * @param req.body.end_date - End date.
 * @param req.body.description - Description.
 * @param req.body.status - Status.
 * @param req.body.skill_ids  - Skill IDs.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, client_id, start_date, end_date, description, status, skill_ids } = req.body

    await createProjectSchema.validate({
      name,
      client_id,
      start_date,
      end_date,
      description,
      status,
    })

    const updatedProject = await ProjectService.updateById(
      parseInt(id),
      {
        name: name as string,
        client_id: parseInt(client_id as string),
        start_date: start_date !== undefined ? new Date(start_date) : null,
        end_date: end_date !== undefined ? new Date(end_date) : null,
        description,
        status,
      },
      skill_ids as number[]
    )

    res.json(updatedProject)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific project by ID.
 * @param req.params.id - The unique ID of the project.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await ProjectService.deleteById(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
