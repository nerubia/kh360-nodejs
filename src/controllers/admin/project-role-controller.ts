import { type Request, type Response } from "express"
import * as ProjectRoleService from "../../services/project-role-service"
import logger from "../../utils/logger"

/**
 * List project roles.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const results = await ProjectRoleService.getAllForProject()
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
/**
 * List all project roles.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const results = await ProjectRoleService.getAll()
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
