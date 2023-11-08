import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationResultStatus } from "../../types/evaluationResultType"
import { EvaluationStatus } from "../../types/evaluationType"
import { Decimal } from "@prisma/client/runtime/library"

/**
 * List evaluation results based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_administration_id, name, status, page } = req.query

    const evaluationResultStatus = status === "all" ? "" : status

    const itemsPerPage = 20
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where = {
      evaluation_administration_id: parseInt(
        evaluation_administration_id as string
      ),
      status: {
        contains: evaluationResultStatus as string,
      },
    }

    if (name !== undefined) {
      Object.assign(where, {
        users: {
          OR: [
            {
              first_name: {
                contains: name as string,
              },
            },
            {
              last_name: {
                contains: name as string,
              },
            },
          ],
        },
      })
    }

    const evaluationResults = await prisma.evaluation_results.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      select: {
        id: true,
        status: true,
        users: {
          select: {
            id: true,
            slug: true,
            first_name: true,
            last_name: true,
            picture: true,
          },
        },
      },
      where,
      orderBy: [
        {
          users: {
            last_name: "asc",
          },
        },
        {
          users: {
            first_name: "asc",
          },
        },
      ],
    })

    const totalItems = await prisma.evaluation_results.count({
      where,
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: evaluationResults,
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
 * Store multiple evaluation results.
 * @param req.body.evaluation_administration_id - Evaluation administration id.
 * @param req.body.employee_ids - Employee IDs.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { evaluation_administration_id, employee_ids } = req.body

    const employeeIds = employee_ids as number[]

    if (employeeIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Must have at least 1 employee selected" })
    }

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
        where: {
          id: parseInt(evaluation_administration_id as string),
        },
      })

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    const currentDate = new Date()

    const data = employeeIds.map((employeeId) => {
      return {
        evaluation_administration_id: evaluationAdministration.id,
        user_id: employeeId,
        status: EvaluationResultStatus.ForReview,
        created_by_id: user.id,
        updated_by_id: user.id,
        created_at: currentDate,
        updated_at: currentDate,
      }
    })

    await prisma.evaluation_results.createMany({
      data,
    })

    const evaluationResults = await prisma.evaluation_results.findMany({
      select: {
        id: true,
        users: {
          select: {
            id: true,
          },
        },
      },
      where: {
        evaluation_administration_id: evaluationAdministration.id,
      },
    })

    const hrTemplate = await prisma.evaluation_templates.findFirst({
      where: {
        evaluee_role_id: 2,
      },
    })

    const hrEvaluators = await prisma.user_roles.findMany({
      select: {
        user_id: true,
      },
      where: {
        name: "khv2_hr_evaluators",
      },
    })

    evaluationResults.forEach(async (evaluationResult) => {
      const evalueeId = evaluationResult.users?.id

      const projects = await prisma.project_members.findMany({
        where: {
          user_id: evalueeId,
          OR: [
            {
              start_date: {
                gte:
                  evaluationAdministration.eval_period_start_date ?? new Date(),
                lte:
                  evaluationAdministration.eval_period_end_date ?? new Date(),
              },
            },
            {
              end_date: {
                gte:
                  evaluationAdministration.eval_period_start_date ?? new Date(),
                lte:
                  evaluationAdministration.eval_period_end_date ?? new Date(),
              },
            },
          ],
        },
      })

      const evaluations: Array<{
        evaluation_template_id: number
        evaluation_administration_id: number | undefined
        evaluation_result_id: number
        evaluator_id: number | null
        evaluee_id: number | undefined
        project_id: number | null
        project_member_id: number | null
        for_evaluation: boolean
        eval_start_date: Date | null
        eval_end_date: Date | null
        percent_involvement: Decimal | null
        status: string
      }> = []

      const evaluationResultDetails: Array<{
        evaluation_administration_id: number | undefined
        user_id: number | undefined
        evaluation_result_id: number
        evaluation_template_id: number
        weight: Decimal | null
        created_at: Date
        updated_at: Date
      }> = []

      for (const project of projects) {
        const projectId = project.project_id
        const roleId = project.project_role_id

        const members = await prisma.project_members.findMany({
          where: {
            user_id: {
              not: evalueeId,
            },
            project_id: projectId,
            OR: [
              {
                start_date: {
                  gte:
                    evaluationAdministration.eval_period_start_date ??
                    new Date(),
                  lte:
                    evaluationAdministration.eval_period_end_date ?? new Date(),
                },
              },
              {
                end_date: {
                  gte:
                    evaluationAdministration.eval_period_start_date ??
                    new Date(),
                  lte:
                    evaluationAdministration.eval_period_end_date ?? new Date(),
                },
              },
            ],
          },
        })

        for (const member of members) {
          const evaluatorRoleId = member.project_role_id

          const evaluationTemplate =
            await prisma.evaluation_templates.findFirst({
              where: {
                evaluee_role_id: roleId,
                evaluator_role_id: evaluatorRoleId,
              },
            })

          if (evaluationTemplate !== null) {
            evaluations.push({
              evaluation_template_id: evaluationTemplate.id,
              evaluation_administration_id: evaluationAdministration.id,
              evaluation_result_id: evaluationResult.id,
              evaluator_id: member.user_id,
              evaluee_id: evalueeId,
              project_id: projectId,
              project_member_id: project.id,
              for_evaluation: false,
              eval_start_date: project.start_date,
              eval_end_date: project.end_date,
              percent_involvement: project.allocation_rate,
              status: EvaluationStatus.Draft,
            })

            const evaluationResultDetail = evaluationResultDetails.find(
              (evaluationResultDetail) =>
                evaluationResultDetail.evaluation_template_id ===
                evaluationTemplate.id
            )

            if (evaluationResultDetail === undefined) {
              evaluationResultDetails.push({
                evaluation_administration_id: evaluationAdministration.id,
                user_id: evalueeId,
                evaluation_result_id: evaluationResult.id,
                evaluation_template_id: evaluationTemplate.id,
                weight: evaluationTemplate.rate,
                created_at: currentDate,
                updated_at: currentDate,
              })
            }
          }
        }
      }

      if (hrTemplate !== null) {
        for (const hr of hrEvaluators) {
          evaluations.push({
            evaluation_template_id: hrTemplate.id,
            evaluation_administration_id: evaluationAdministration.id,
            evaluation_result_id: evaluationResult.id,
            evaluator_id: hr.user_id,
            evaluee_id: evalueeId,
            project_id: null,
            project_member_id: null,
            for_evaluation: false,
            eval_start_date: evaluationAdministration.eval_period_start_date,
            eval_end_date: evaluationAdministration.eval_period_end_date,
            percent_involvement: new Decimal(100),
            status: EvaluationStatus.Draft,
          })
        }

        evaluationResultDetails.push({
          evaluation_administration_id: evaluationAdministration.id,
          user_id: evalueeId,
          evaluation_result_id: evaluationResult.id,
          evaluation_template_id: hrTemplate.id,
          weight: hrTemplate.rate,
          created_at: currentDate,
          updated_at: currentDate,
        })
      }

      await prisma.evaluations.createMany({
        data: evaluations,
      })

      await prisma.evaluation_result_details.createMany({
        data: evaluationResultDetails,
      })
    })

    res.json(employee_ids)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific evaluation result by ID.
 * @param req.params.id - The unique ID of the evaluation result.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluationResult = await prisma.evaluation_results.findUnique({
      select: {
        id: true,
        evaluation_administration_id: true,
        status: true,
        users: {
          select: {
            id: true,
            slug: true,
            first_name: true,
            last_name: true,
            picture: true,
          },
        },
      },
      where: {
        id: parseInt(id),
      },
    })

    const previousEvaluationResult = await prisma.evaluation_results.findFirst({
      where: {
        id: { lt: evaluationResult?.id },
        evaluation_administration_id:
          evaluationResult?.evaluation_administration_id,
      },
      orderBy: { id: "desc" },
    })

    const nextEvaluationResult = await prisma.evaluation_results.findFirst({
      where: {
        id: { gt: evaluationResult?.id },
        evaluation_administration_id:
          evaluationResult?.evaluation_administration_id,
      },
      orderBy: { id: "asc" },
    })

    res.json({
      data: evaluationResult,
      previousId: previousEvaluationResult?.id,
      nextId: nextEvaluationResult?.id,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific evaluation result by ID.
 * @param req.params.id - The unique ID of the evaluation result.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.evaluation_results.deleteMany({
      where: {
        id: parseInt(id),
      },
    })
    await prisma.evaluations.deleteMany({
      where: {
        evaluation_result_id: parseInt(id),
      },
    })
    res.json({ id })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update evaluation result status by ID.
 * @param req.params.id - The unique ID of the evaluation result.
 * @param req.body.status - Evaluation result status.
 */
export const setStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const evaluationResult = await prisma.evaluation_results.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluationResult === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    await prisma.evaluation_results.update({
      where: {
        id: evaluationResult.id,
      },
      data: {
        status,
      },
    })

    res.json({
      id,
      status,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
