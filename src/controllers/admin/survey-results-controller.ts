import { type Request, type Response } from "express"
import { ValidationError } from "yup"
import * as SurveyResultService from "../../services/survey-result-service"
import CustomError from "../../utils/custom-error"

/**
 * List survey results based on provided filters.
 * @param req.query.survey_administration_id - Filter by evaluation administration id.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query

    const surveyResults = await SurveyResultService.getAllBySurveyAdminId(
      parseInt(survey_administration_id as string)
    )

    res.json(surveyResults)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Create new Survey result
 * @param req.body.survey_administration_id - Survey administration id.
 * @param req.body.employee_ids - Employee IDs.
 * @returns
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { survey_administration_id, employee_ids } = req.body

    const newSurvey = await SurveyResultService.create(
      parseInt(survey_administration_id as string),
      employee_ids as number[],
      user
    )

    res.json(newSurvey)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
