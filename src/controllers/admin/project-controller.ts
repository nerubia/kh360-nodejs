import { type Request, type Response } from "express"
import * as ProjectService from "../../services/project-service"

/**
 * List projects based on provided filters.
 * @param req.query.name - Filter by name.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name } = req.query
    const results = await ProjectService.getAllByFilters(name as string)
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
