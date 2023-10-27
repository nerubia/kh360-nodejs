import { type Request, type Response } from "express"
import { createEvaluationSchema } from "../../utils/validation/evaluations/createEvaluationSchema"
import { ValidationError } from "yup"
import prisma from "../../utils/prisma"
import { EvaluationAdministrationStatus } from "../../types/evaluationAdministrationType"

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

    const itemsPerPage = 20
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

    const newEvaluation = await prisma.evaluation_administrations.create({
      data: {
        name,
        eval_period_start_date: new Date(eval_period_start_date),
        eval_period_end_date: new Date(eval_period_end_date),
        eval_schedule_start_date: new Date(eval_schedule_start_date),
        eval_schedule_end_date: new Date(eval_schedule_end_date),
        remarks,
        email_subject,
        email_content,
      },
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
 * @param req.params.id - The unique ID of the evaluation administration
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluation = await prisma.evaluation_administrations.findUnique({
      where: {
        id: parseInt(id),
      },
    })
    res.json(evaluation)
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

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
        where: {
          id: parseInt(id),
        },
      })

    if (
      evaluationAdministration?.status ===
        EvaluationAdministrationStatus.Draft &&
      (evaluationAdministration.name !== null ||
        evaluationAdministration.eval_period_start_date !== null ||
        eval_period_end_date !== null ||
        evaluationAdministration.email_subject !== null ||
        evaluationAdministration.email_content !== null)
    ) {
      return res.status(400).json({ message: "This action is not allowed" })
    }

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

    const updatedEvaluationAdministration =
      await prisma.evaluation_administrations.update({
        where: {
          id: parseInt(id),
        },
        data: {
          name,
          eval_period_start_date: new Date(eval_period_start_date),
          eval_period_end_date: new Date(eval_period_end_date),
          eval_schedule_start_date: new Date(eval_schedule_start_date),
          eval_schedule_end_date: new Date(eval_schedule_end_date),
          remarks,
          email_subject,
          email_content,
        },
      })

    res.json(updatedEvaluationAdministration)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
