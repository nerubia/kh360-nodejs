import { type Request, type Response } from "express"

import { ValidationError } from "yup"

import * as EvaluationAdministrationService from "../../services/evaluation-administration-service"
import * as EvaluationResultService from "../../services/evaluation-result-service"

import { createEvaluationSchema } from "../../utils/validation/evaluations/createEvaluationSchema"
import prisma from "../../utils/prisma"
import { EvaluationAdministrationStatus } from "../../types/evaluation-administration-type"
import { EvaluationStatus } from "../../types/evaluation-type"
import { EvaluationResultStatus } from "../../types/evaluationResultType"
import { type Decimal } from "@prisma/client/runtime/library"

/**
 * List evaluation administrations based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, status, page } = req.query

    const evaluationStatus = status === "all" ? "" : status

    const itemsPerPage = 10
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const evaluations = await prisma.evaluation_administrations.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      where: {
        name: {
          contains: name as string,
        },
        status: {
          contains: evaluationStatus as string,
        },
      },
      orderBy: {
        id: "desc",
      },
    })

    const totalItems = await prisma.evaluation_administrations.count({
      where: {
        name: {
          contains: name as string,
        },
        status: {
          contains: evaluationStatus as string,
        },
      },
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: evaluations,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalPages,
        totalItems,
      },
    })
  } catch (error) {
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

    await createEvaluationSchema.validate({
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

    await createEvaluationSchema.validate({
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
      evaluationAdministration.status !== EvaluationAdministrationStatus.Ongoing &&
      evaluationAdministration.status !== EvaluationAdministrationStatus.Draft
    ) {
      return res.status(400).json({ message: "This action is not allowed." })
    }

    const data = {
      eval_schedule_start_date: new Date(eval_schedule_start_date),
      eval_schedule_end_date: new Date(eval_schedule_end_date),
      remarks,
    }

    if (evaluationAdministration.status === EvaluationAdministrationStatus.Draft) {
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
      (evaluationResult) => evaluationResult.status !== EvaluationResultStatus.Ready
    )

    res.json({
      canGenerate: notReadyEvaluationResults.length === 0,
    })
  } catch (error) {
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
      (evaluationResult) => evaluationResult.status !== EvaluationResultStatus.Ready
    )

    if (notReadyEvaluationResults.length > 0) {
      return res.status(400).json({ message: "All evaluees must be ready." })
    }

    const currentDate = new Date()

    const status =
      evaluationAdministration.eval_schedule_start_date != null &&
      evaluationAdministration.eval_schedule_start_date > currentDate
        ? EvaluationAdministrationStatus.Pending
        : EvaluationAdministrationStatus.Ongoing

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
              evaluationAdministration.eval_schedule_start_date > currentDate
                ? EvaluationStatus.Pending
                : EvaluationStatus.Open,
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
            created_at: currentDate,
            updated_at: currentDate,
          })
        }
      }
    }

    await prisma.evaluation_ratings.createMany({
      data: evaluationRatings,
    })

    if (status === EvaluationAdministrationStatus.Ongoing) {
      void EvaluationResultService.updateStatusByAdministrationId(
        evaluationAdministration.id,
        EvaluationResultStatus.Ongoing
      )
      void EvaluationAdministrationService.sendEvaluationEmailById(evaluationAdministration.id)
    }

    res.json({ id })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
