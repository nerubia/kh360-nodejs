import { type Request, type Response } from "express"
import * as SurveyTemplateService from "../../services/survey-template-service"

/**
 * List all survey templates
 */
export const getAllSkillCategories = async (req: Request, res: Response) => {
  try {
    const survey_templates = await SurveyTemplateService.getAllSkillCategories()
    res.json(survey_templates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
