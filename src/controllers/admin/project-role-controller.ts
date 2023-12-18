import { type Request, type Response } from "express"
import * as ProjectRoleService from "../../services/project-role-service"

/**
 * List project roles.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const results = await ProjectRoleService.getAllForProject()
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
