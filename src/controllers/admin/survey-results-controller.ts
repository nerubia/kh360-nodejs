import { type Request, type Response } from "express"
import { ValidationError } from "yup"
import * as SurveyResultService from "../../services/survey-result-service"
import CustomError from "../../utils/custom-error"
import { SurveyResultStatus } from "../../types/survey-result-type"
import logger from "../../utils/logger"

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
    logger.error(error)
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

    const { survey_administration_id, employee_ids, is_external } = req.body

    const newSurvey = await SurveyResultService.create(
      parseInt(survey_administration_id as string),
      employee_ids as number[],
      user,
      is_external as boolean
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

/**
 * Send reminder for respondent by ID.
 * @param req.params.id - The unique ID of the survey administration.
 * @param req.body.user_id - Respondent id
 */
export const sendReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { user_id } = req.body

    const emailLog = await SurveyResultService.sendReminderByRespondent(
      parseInt(id),
      parseInt(user_id as string)
    )
    res.json({ respondentId: user_id, emailLog })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get survey results by survey administration ID.
 * @param req.query.survey_administration_id - The unique ID of the survey administration
 */
export const showResultsBySurveyAdmin = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query
    const survey = await SurveyResultService.getResultsByRespondent(
      parseInt(survey_administration_id as string)
    )
    res.json(survey)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get survey results by survey administration ID.
 * @param req.query.survey_administration_id - The unique ID of the survey administration
 */
export const showResultsByAnswer = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query
    const survey = await SurveyResultService.getResultsByAnswer(
      parseInt(survey_administration_id as string)
    )
    res.json(survey)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific survey result by ID.
 * @param req.params.id - The unique ID of the survey result.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SurveyResultService.reopen(parseInt(id))
    res.json({ id, status: SurveyResultStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get survey results by survey administration ID.
 * @param req.query.survey_administration_id - The unique ID of the survey administration
 */
export const showResultsBySurveyAdmin = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query
    const survey = await SurveyResultService.getResultsByRespondent(
      parseInt(survey_administration_id as string)
    )
    res.json(survey)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get survey results by survey administration ID.
 * @param req.query.survey_administration_id - The unique ID of the survey administration
 */
export const showResultsByAnswer = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query
    const survey = await SurveyResultService.getResultsByAnswer(
      parseInt(survey_administration_id as string)
    )
    res.json(survey)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific survey result by ID.
 * @param req.params.id - The unique ID of the survey result.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SurveyResultService.reopen(parseInt(id))
    res.json({ id, status: SurveyResultStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
