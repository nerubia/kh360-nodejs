import { type Request, type Response } from "express"
import * as SkillCategoryService from "../../services/skill-category-service"

/**
 * List all skill categories
 */
export const index = async (req: Request, res: Response) => {
  try {
    const skill_categories = await SkillCategoryService.getAllSkillCategories()
    res.json(skill_categories)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
