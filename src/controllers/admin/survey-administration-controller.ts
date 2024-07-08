import { ValidationError } from "yup"
import { type Request, type Response } from "express"
import * as SurveyAdministrationService from "../../services/survey-administration-service"
import CustomError from "../../utils/custom-error"
import { createSurveyAdministrationSchema } from "../../utils/validation/survey-administration-schema"
import { SurveyAdministrationStatus } from "../../types/survey-administration-type"
import logger from "../../utils/logger"

/**
 *List survey administrations
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status, page } = req.query
    const survey = await SurveyAdministrationService.getAllByFilters(
      name as string,
      status as string,
      page as string
    )
    res.json(survey)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific survey administration by ID.
 * @param req.params.id - The unique ID of the survey administration
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const survey = await SurveyAdministrationService.getById(parseInt(id))
    res.json(survey)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new survey administration
 * @param req.body.name - Name
 * @param req.body.survey_start_date - Survey start date
 * @param req.body.survey_end_date - Survey end date
 * @param req.body.survey_template_id - Survey template id
 * @param req.body.remarks - Survey remarks
 * @param req.body.email_subject - Email subject
 * @param req.body.email_content - Email content
 * @param req.body.status - Status
 */
export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      survey_start_date,
      survey_end_date,
      survey_template_id,
      remarks,
      email_subject,
      email_content,
      status,
    } = req.body
    await createSurveyAdministrationSchema.validate({
      name,
      survey_start_date,
      survey_end_date,
      survey_template_id: parseInt(survey_template_id),
      remarks,
      email_subject,
      email_content,
      status,
    })

    const newSurvey = await SurveyAdministrationService.create({
      name: name as string,
      survey_start_date: new Date(survey_start_date),
      survey_end_date: new Date(survey_end_date),
      survey_template_id: parseInt(survey_template_id),
      remarks,
      email_subject,
      email_content,
      status: SurveyAdministrationStatus.Draft,
    })
    return res.json(newSurvey)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(500).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing survey administration by ID
 * @param req.body.name - Name
 * @param req.body.survey_start_date - Survey start date
 * @param req.body.survey_end_date - Survey end date
 * @param req.body.survey_template_id - Survey template id
 * @param req.body.remarks - Survey remarks
 * @param req.body.email_subject - Email subject
 * @param req.body.email_content - Email content
 * @param req.body.status - Status
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      name,
      survey_start_date,
      survey_end_date,
      survey_template_id,
      remarks,
      email_subject,
      email_content,
      status,
    } = req.body
    await createSurveyAdministrationSchema.validate({
      name,
      survey_start_date,
      survey_end_date,
      survey_template_id: parseInt(survey_template_id),
      remarks,
      email_subject,
      email_content,
      status,
    })
    const updateSurvey = await SurveyAdministrationService.updateById(parseInt(id), {
      name: name as string,
      survey_start_date: new Date(survey_start_date),
      survey_end_date: new Date(survey_end_date),
      survey_template_id: parseInt(survey_template_id),
      remarks: remarks as string,
      email_subject: email_subject as string,
      email_content: email_content as string,
      status,
    })
    res.json(updateSurvey)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific survey administration by ID.
 * @param req.params.id - The unique ID of the survey administration.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const survey = await SurveyAdministrationService.getById(parseInt(id))
    if (survey === null) {
      return res.status(400).json({ message: "Invalid id" })
    }
    await SurveyAdministrationService.deleteById(parseInt(id))
    res.json({ id, message: "Survey deleted Successfully" })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Close a specific survey administration by ID.
 * @param req.params.id - The unique ID of the survey administration.
 */
export const close = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SurveyAdministrationService.close(parseInt(id))
    res.json({ id, status: SurveyAdministrationStatus.Closed })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Cancel a specific survey administration by ID.
 * @param req.params.id - The unique ID of the survey administration.
 */
export const cancel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SurveyAdministrationService.cancel(parseInt(id))
    res.json({ id, status: SurveyAdministrationStatus.Cancelled })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific survey administration by ID.
 * @param req.params.id - The unique ID of the survey administration.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await SurveyAdministrationService.reopen(parseInt(id))
    res.json({ id, status: SurveyAdministrationStatus.Ongoing })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
