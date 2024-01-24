import { type Request, type Response } from "express"
import * as ProjectSkillService from "../../services/project-skill-service"

/**
 * List project skills based on provided filters.
 * @param req.query.project_id - Filter by project.
 * @param req.query.name - Filter by name.
 * @param req.query.skill_category_id - Filter by skill_category_id.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { project_id, name, skill_category_id, page } = req.query

    const skills = await ProjectSkillService.getAllByFilters(
      project_id as string,
      name as string,
      skill_category_id as string,
      page as string
    )

    res.json(skills)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
