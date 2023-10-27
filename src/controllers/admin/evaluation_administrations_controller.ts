import { type Request, type Response } from "express"
import { createEvaluationSchema } from "../../utils/validation/evaluations/createEvaluationSchema"
import { ValidationError } from "yup"
import prisma from "../../utils/prisma"
import { EvaluationAdministrationStatus } from "../../types/evaluationAdministrationType"
import { EvaluationStatus } from "../../types/evaluationType"
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
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
        where: {
          id: parseInt(id),
        },
      })

    const evaluationResults = await prisma.evaluation_results.findMany({
      select: {
        id: true,
        users: true,
      },
      where: {
        evaluation_administration_id: evaluationAdministration?.id,
      },
    })

    const evaluation_results_details = await Promise.all(
      evaluationResults.map(async (evaluationResult) => {
        const evaluations = await prisma.evaluations.findMany({
          where: {
            evaluation_administration_id: parseInt(id),
            evaluee_id: evaluationResult.users?.id,
            for_evaluation: true,
          },
          distinct: ["evaluator_id", "project_id"],
        })

        const evaluationDetails = await Promise.all(
          evaluations.map(async (evaluation) => {
            const evaluation_template =
              await prisma.evaluation_templates.findFirst({
                where: {
                  id: evaluation.evaluation_template_id as number,
                },
              })

            const evaluee_role = await prisma.project_roles.findFirst({
              where: {
                id: evaluation_template?.evaluee_role_id ?? undefined,
              },
            })

            const evaluator_role = await prisma.project_roles.findFirst({
              where: {
                id: evaluation_template?.evaluator_role_id ?? undefined,
              },
            })

            const evaluator = await prisma.users.findFirst({
              where: {
                id: evaluation.evaluator_id as number,
              },
            })

            const project = await prisma.projects.findFirst({
              where: {
                id: evaluation.project_id as number,
              },
            })

            return {
              id,
              evaluator,
              project,
              evaluee_role,
              evaluator_role,
              percent_involvement: evaluation.percent_involvement,
              eval_start_date: evaluation.eval_start_date,
              eval_end_date: evaluation.eval_end_date,
              evaluation_template_id: evaluation_template?.id,
              evaluation_template_name: evaluation_template?.display_name,
            }
          })
        )

        const evaluation_details_grouped = evaluationDetails.reduce<
          Array<{
            evaluation_template_id: number
            evaluation_template_name: string
            evaluation_details: Array<Record<string, unknown>>
          }>
        >((evaluation, group) => {
          const found = evaluation.find(
            (x) => x.evaluation_template_id === group.evaluation_template_id
          )

          if (found !== null && found !== undefined) {
            found?.evaluation_details.push(group)
          } else {
            const evaluationTemplateName = group.evaluation_template_name ?? ""
            const evaluationTemplateId = group.evaluation_template_id ?? 0

            evaluation.push({
              evaluation_template_id: evaluationTemplateId,
              evaluation_template_name: evaluationTemplateName,
              evaluation_details: [group],
            })
          }
          return evaluation
        }, [])

        return {
          id: evaluationResult.id,
          evaluee: evaluationResult.users,
          evaluation_templates: evaluation_details_grouped,
        }
      })
    )

    Object.assign(evaluationAdministration as Record<string, unknown>, {
      evaluation_results: evaluation_results_details,
    })

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

/**
 * Check if records can be be generated by ID.
 * @param req.params.id - The unique ID of the evaluation administration.
 */
export const generateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
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
        evaluationResult.status !== EvaluationResultStatus.Ready
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

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
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
        evaluationResult.status !== EvaluationResultStatus.Ready
    )

    if (notReadyEvaluationResults.length > 0) {
      return res.status(400).json({ message: "All evaluees must be ready." })
    }

    const currentDate = new Date()

    await prisma.evaluation_administrations.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status:
          evaluationAdministration.eval_schedule_start_date != null &&
          evaluationAdministration.eval_schedule_start_date > currentDate
            ? EvaluationAdministrationStatus.Pending
            : EvaluationAdministrationStatus.Ongoing,
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
        },
        distinct: ["evaluator_id", "project_id"],
      })

      for (const evaluation of evaluations) {
        if (
          evaluation.status === EvaluationStatus.Draft &&
          evaluation.for_evaluation === true
        ) {
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

          const evaluationTemplateContents =
            await prisma.evaluation_template_contents.findMany({
              where: {
                evaluation_template_id: evaluation.evaluation_template_id,
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
    }

    await prisma.evaluation_ratings.createMany({
      data: evaluationRatings,
    })

    res.json({ id })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
