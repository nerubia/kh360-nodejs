import { type Request, type Response } from "express"
import * as SurveyTemplateQuestionService from "../../services/survey-template-question-service"
import CustomError from "../../utils/custom-error"

/**
 * List survey template questions based on provided filters.
 * @param req.query.survey_template_id - Filter by survey template id.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const { survey_template_id } = req.query

    const surveyTemplateQuestions = await SurveyTemplateQuestionService.getBySurveyTemplateId(
      parseInt(survey_template_id as string)
    )

    res.json(surveyTemplateQuestions)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
