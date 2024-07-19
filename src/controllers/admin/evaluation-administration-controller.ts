import { type Request, type Response } from "express"

import { ValidationError } from "yup"

import * as EvaluationAdministrationService from "../../services/evaluation-administration-service"

import prisma from "../../utils/prisma"
import { EvaluationAdministrationStatus } from "../../types/evaluation-administration-type"
import { EvaluationStatus } from "../../types/evaluation-type"
import { EvaluationResultStatus } from "../../types/evaluation-result-type"
import { type Decimal } from "@prisma/client/runtime/library"
import CustomError from "../../utils/custom-error"
import {
  addEvaluatorSchema,
  addExternalEvaluatorsSchema,
  createEvaluationAdministrationSchema,
} from "../../utils/validation/evaluation-administration-schema"
import logger from "../../utils/logger"

/**
 * List evaluation administrations based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status, page } = req.query
    const evaluationAdministrations = await EvaluationAdministrationService.getAllByFilters(
      name as string,
      status as string,
      page as string
    )
    res.json(evaluationAdministrations)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new evaluation administration.
 * @param req.body.name - Name.
 * @param req.body.eval_period_start_date - Evaluation period start date.
 * @param req.body.eval_period_end_date - Evaluation period end date.
 * @param req.body.eval_schedule_start_date - Evaluation schedule start date.
 * @param req.body.eval_schedule_end_date - Evaluation schedule end date.
 * @param req.body.remarks - Remarks.
 * @param req.body.email_subject - Email subject.
 * @param req.body.email_content - Email content.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    } = req.body

    await createEvaluationAdministrationSchema.validate({
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    })

    const newEvaluation = await EvaluationAdministrationService.create({
      name,
      eval_period_start_date: new Date(eval_period_start_date),
      eval_period_end_date: new Date(eval_period_end_date),
      eval_schedule_start_date: new Date(eval_schedule_start_date),
      eval_schedule_end_date: new Date(eval_schedule_end_date),
      remarks,
      email_subject,
      email_content,
      status: EvaluationAdministrationStatus.Draft,
    })

    res.json(newEvaluation)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluationAdministration = await EvaluationAdministrationService.getById(parseInt(id))
    res.json(evaluationAdministration)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 * @param req.body.name - Name.
 * @param req.body.eval_period_start_date - Evaluation period start date.
 * @param req.body.eval_period_end_date - Evaluation period end date.
 * @param req.body.eval_schedule_start_date - Evaluation schedule start date.
 * @param req.body.eval_schedule_end_date - Evaluation schedule end date.
 * @param req.body.remarks - Remarks.
 * @param req.body.email_subject - Email subject.
 * @param req.body.email_content - Email content.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    } = req.body

    await createEvaluationAdministrationSchema.validate({
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
      email_subject,
      email_content,
    })

    const evaluationAdministration = await EvaluationAdministrationService.getById(parseInt(id))

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id." })
    }

    if (
      evaluationAdministration.status !== EvaluationAdministrationStatus.Pending &&
      evaluationAdministration.status !== EvaluationAdministrationStatus.Draft
    ) {
      return res.status(400).json({ message: "This action is not allowed." })
    }

    const data = {
      eval_schedule_start_date: new Date(eval_schedule_start_date),
      eval_schedule_end_date: new Date(eval_schedule_end_date),
      remarks,
    }

    if (
      evaluationAdministration.status === EvaluationAdministrationStatus.Draft ||
      evaluationAdministration.status === EvaluationAdministrationStatus.Pending
    ) {
      Object.assign(data, {
        name,
        eval_period_start_date: new Date(eval_period_start_date),
        eval_period_end_date: new Date(eval_period_end_date),
        email_subject,
        email_content,
      })
    }

    const updatedEvaluationAdministration = await prisma.evaluation_administrations.update({
      where: {
        id: parseInt(id),
      },
      data,
    })

    res.json(updatedEvaluationAdministration)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const evaluationAdministration = await EvaluationAdministrationService.getById(parseInt(id))

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    if (evaluationAdministration.status !== EvaluationAdministrationStatus.Draft) {
      return res.status(403).json({ message: "This action is not allowed" })
    }

    await prisma.evaluation_administrations.deleteMany({
      where: {
        id: evaluationAdministration.id,
      },
    })

    await prisma.evaluation_results.deleteMany({
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    await prisma.evaluation_result_details.deleteMany({
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    await prisma.evaluations.deleteMany({
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    await prisma.evaluation_ratings.deleteMany({
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    res.json({ id })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Check if records can be be generated by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const generateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const evaluationAdministration = await prisma.evaluation_administrations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    const evaluationResults = await prisma.evaluation_results.findMany({
      select: {
        id: true,
        status: true,
      },
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    const notReadyEvaluationResults = evaluationResults.filter(
      (evaluationResult) =>
        evaluationResult.status !== EvaluationResultStatus.Ready &&
        evaluationResult.status !== EvaluationResultStatus.Ongoing &&
        evaluationResult.status !== EvaluationResultStatus.Completed
    )

    const canGenerate =
      notReadyEvaluationResults.length === 0 &&
      !evaluationResults.every(
        (result) =>
          result.status === EvaluationResultStatus.Completed ||
          result.status === EvaluationResultStatus.Ongoing
      )

    res.json({
      canGenerate,
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Generates evaluation records and related data by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const generate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const currentDateTime = new Date()
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const evaluationAdministration = await prisma.evaluation_administrations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    if (evaluationAdministration.eval_schedule_end_date !== null) {
      const evaluation_end_date = new Date(evaluationAdministration.eval_schedule_end_date)
      evaluation_end_date.setHours(0, 0, 0, 0)

      if (evaluation_end_date < currentDate) {
        return res
          .status(400)
          .json({ message: "Unable to proceed. Evaluation schedule has lapsed." })
      }
    }

    const evaluations = await prisma.evaluations.findMany({
      where: {
        evaluation_administration_id: parseInt(id),
        for_evaluation: true,
      },
    })
    const evaluationResults = await prisma.evaluation_results.findMany({
      select: {
        id: true,
        status: true,
      },
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    const notReadyEvaluationResults = evaluationResults.filter(
      (evaluationResult) =>
        evaluationResult.status !== EvaluationResultStatus.Ready &&
        evaluationResult.status !== EvaluationResultStatus.Ongoing
    )

    if (evaluations.length === 0) {
      return res.status(400).json({ message: "Add atleast 1 evaluator." })
    }

    if (notReadyEvaluationResults.length > 0) {
      return res.status(400).json({ message: "All evaluees must be ready." })
    }

    const status =
      evaluationAdministration.eval_schedule_start_date != null &&
      evaluationAdministration.eval_schedule_start_date > currentDateTime
        ? EvaluationAdministrationStatus.Pending
        : EvaluationAdministrationStatus.Processing

    await prisma.evaluation_administrations.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status,
      },
    })

    const evaluationRatings: Array<{
      evaluation_administration_id: number
      evaluation_id: number
      evaluation_template_id: number | null
      evaluation_template_content_id: number
      percentage: Decimal | null
      created_at: Date
      updated_at: Date
    }> = []

    for (const evaluationResult of evaluationResults) {
      const evaluations = await prisma.evaluations.findMany({
        where: {
          evaluation_result_id: evaluationResult.id,
          for_evaluation: true,
          status: EvaluationStatus.Draft,
        },
      })

      for (const evaluation of evaluations) {
        await prisma.evaluations.update({
          where: {
            id: evaluation.id,
          },
          data: {
            status:
              evaluationAdministration.eval_schedule_start_date != null &&
              evaluationAdministration.eval_schedule_start_date > currentDateTime
                ? EvaluationStatus.Pending
                : EvaluationStatus.Open,
            updated_at: currentDateTime,
          },
        })

        const evaluationTemplateContents = await prisma.evaluation_template_contents.findMany({
          where: {
            evaluation_template_id: evaluation.evaluation_template_id,
            is_active: true,
          },
        })

        for (const evaluationTemplateContent of evaluationTemplateContents) {
          evaluationRatings.push({
            evaluation_administration_id: evaluationAdministration.id,
            evaluation_id: evaluation.id,
            evaluation_template_id: evaluation.evaluation_template_id,
            evaluation_template_content_id: evaluationTemplateContent.id,
            percentage: evaluationTemplateContent.rate,
            created_at: currentDateTime,
            updated_at: currentDateTime,
          })
        }
      }
    }

    await prisma.evaluation_ratings.createMany({
      data: evaluationRatings,
    })

    res.json({ id })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Generates updated evaluation records and related data by ID.
 * @param req.params.evaluation_result_id - The unique ID of the evaluation result.
 */
export const generateUpdate = async (req: Request, res: Response) => {
  try {
    const { evaluation_result_id } = req.params

    await EvaluationAdministrationService.generateUpdate(parseInt(evaluation_result_id))

    res.json({ evaluation_result_id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Cancel a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const cancel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationAdministrationService.cancel(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Close a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const close = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationAdministrationService.close(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Publish a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const publish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationAdministrationService.publish(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Reopen a specific evaluation administration by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const reopen = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { eval_end_date } = req.body
    await EvaluationAdministrationService.reopen(parseInt(id), eval_end_date)
    res.json({ id, eval_end_date })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send reminder for evaluator by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 * @param req.body.user_id - Evaluator id
 * @param req.body.is_external - Check if user is an external evaluator
 */
export const sendReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { user_id, is_external } = req.body

    const emailLog = await EvaluationAdministrationService.sendReminderByEvaluator(
      parseInt(id),
      parseInt(user_id as string),
      Boolean(is_external)
    )
    res.json({ evaluatorId: user_id, emailLog })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List evaluators by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const getEvaluators = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const results = await EvaluationAdministrationService.getEvaluators(parseInt(id))
    res.json(results)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Add evaluator by ID
 * @param req.params.id - The unique ID of the evaluation administration.
 * @param req.body.evaluation_template_id - Evaluation template id.
 * @param req.body.evaluation_result_id - Evaluation result id.
 * @param req.body.evaluee_id - User id.
 * @param req.body.project_member_id - Project member id.
 * @param req.body.user_id - User id.
 * @param req.body.is_external - Is external.
 */
export const addEvaluator = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      evaluation_template_id,
      evaluation_result_id,
      evaluee_id,
      project_member_id,
      user_id,
      is_external,
    } = req.body

    await addEvaluatorSchema.validate({
      evaluation_template_id,
      evaluation_result_id,
      evaluee_id,
      project_member_id,
      user_id,
      is_external,
    })

    await EvaluationAdministrationService.addEvaluator(
      parseInt(id),
      parseInt(evaluation_template_id),
      parseInt(evaluation_result_id),
      parseInt(evaluee_id),
      project_member_id !== undefined ? parseInt(project_member_id) : null,
      parseInt(user_id),
      Boolean(parseInt(is_external))
    )

    res.json({ id })
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
 * Add external evaluators by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 * @param req.body.evaluation_template_id - Evaluation template id.
 * @param req.body.evaluation_result_id - Evaluation result id.
 * @param req.body.evaluee_id - User id.
 * @param req.body.external_user_ids - External user ids.
 */
export const addExternalEvaluators = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { evaluation_template_id, evaluation_result_id, evaluee_id, external_user_ids } = req.body

    await addExternalEvaluatorsSchema.validate({
      evaluation_template_id,
      evaluation_result_id,
      evaluee_id,
      external_user_ids,
    })

    await EvaluationAdministrationService.addExternalEvaluators(
      parseInt(id),
      parseInt(evaluation_template_id),
      parseInt(evaluation_result_id),
      parseInt(evaluee_id),
      external_user_ids
    )

    res.json({ id })
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
