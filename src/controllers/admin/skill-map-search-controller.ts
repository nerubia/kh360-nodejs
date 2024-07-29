import { type Request, type Response } from "express"
import * as SkillMapSearchService from "../../services/skill-map-search-service"
import logger from "../../utils/logger"
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status, skill, sortBy, page } = req.query
    const skillMapSearch = await SkillMapSearchService.getAllByFilters(
      name as string,
      status as string,
      skill as string,
      sortBy as string,
      page as string
    )
    res.json(skillMapSearch)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
