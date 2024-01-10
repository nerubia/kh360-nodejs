import { type Request, type Response } from "express"
import * as ProjectService from "../../services/project-service"
import CustomError from "../../utils/custom-error"

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
