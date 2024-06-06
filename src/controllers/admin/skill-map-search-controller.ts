import { type Request, type Response } from "express"
import * as SkillMapSearchService from "../../services/skill-map-search-service"
export const index = async (req: Request, res: Response) => {
  try {
    const { name, skill, page } = req.query
    const skillMapSearch = await SkillMapSearchService.getAllByFilters(
      name as string,
      skill as string,
      page as string
    )
    res.json(skillMapSearch)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
