import { type Request, type Response } from "express"
import * as SurveyTemplateService from "../../services/survey-template-service"
import logger from "../../utils/logger"

/**
 * List all survey templates
 */
export const getAllSurveyTemplates = async (req: Request, res: Response) => {
  try {
    const survey_templates = await SurveyTemplateService.getAllSurveyTemplates()
    res.json(survey_templates)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
