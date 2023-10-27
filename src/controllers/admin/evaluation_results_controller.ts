import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationResultStatus } from "../../types/evaluationResultType"
import { EvaluationStatus } from "../../types/evaluationType"

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
 * @param req.body.name - Name.
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

    const currentDate = new Date()

    const data = employeeIds.map((employeeId) => {
      return {
        evaluation_administration_id: parseInt(
          evaluation_administration_id as string
        ),
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

    const evaluationAdministration =
      await prisma.evaluation_administrations.findUnique({
        where: {
          id: parseInt(evaluation_administration_id as string),
        },
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
        evaluation_administration_id: evaluationAdministration?.id,
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
                  evaluationAdministration?.eval_period_start_date ??
                  new Date(),
                lte:
                  evaluationAdministration?.eval_period_end_date ?? new Date(),
              },
            },
            {
              end_date: {
                gte:
                  evaluationAdministration?.eval_period_start_date ??
                  new Date(),
                lte:
                  evaluationAdministration?.eval_period_end_date ?? new Date(),
              },
            },
          ],
        },
      })

      projects.forEach(async (project) => {
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
                    evaluationAdministration?.eval_period_start_date ??
                    new Date(),
                  lte:
                    evaluationAdministration?.eval_period_end_date ??
                    new Date(),
                },
              },
              {
                end_date: {
                  gte:
                    evaluationAdministration?.eval_period_start_date ??
                    new Date(),
                  lte:
                    evaluationAdministration?.eval_period_end_date ??
                    new Date(),
                },
              },
            ],
          },
        })

        members.forEach(async (member) => {
          const evaluatorRoleId = member.project_role_id

          const evaluationTemplate =
            await prisma.evaluation_templates.findFirst({
              where: {
                evaluee_role_id: roleId,
                evaluator_role_id: evaluatorRoleId,
              },
            })

          if (evaluationTemplate !== null) {
            await prisma.evaluations.create({
              data: {
                evaluation_template_id: evaluationTemplate.id,
                evaluation_administration_id: evaluationAdministration?.id,
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
              },
            })
          }
        })
      })

      if (hrTemplate !== null) {
        hrEvaluators.forEach(async (hr) => {
          await prisma.evaluations.create({
            data: {
              evaluation_template_id: hrTemplate.id,
              evaluation_administration_id: evaluationAdministration?.id,
              evaluation_result_id: evaluationResult.id,
              evaluator_id: hr.user_id,
              evaluee_id: evalueeId,
              project_id: null,
              project_member_id: null,
              for_evaluation: false,
              eval_start_date: evaluationAdministration?.eval_period_start_date,
              eval_end_date: evaluationAdministration?.eval_period_end_date,
              percent_involvement: 100,
              status: EvaluationStatus.Draft,
            },
          })
        })
      }
    })

    res.json(employee_ids)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific evaluation result by ID.
 * @param req.params.id - The unique ID of the evaluation result
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluationResult = await prisma.evaluation_results.findUnique({
      select: {
        id: true,
        status: true,
        users: {
          select: {
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
    res.json(evaluationResult)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific evaluation result by ID.
 * @param req.params.id - The unique ID of the evaluation result
 */
export const deleteEvaluationResult = async (req: Request, res: Response) => {
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

// TODO: Refactor
export const getEvaluationTemplates = async (req: Request, res: Response) => {
  try {
    const { evaluation_result_id } = req.query

    const evaluations = await prisma.evaluations.findMany({
      where: {
        evaluation_result_id: parseInt(evaluation_result_id as string),
      },
      distinct: ["evaluation_template_id"],
    })

    const evaluationTemplateIds = evaluations.map(
      (evaluation) => evaluation.evaluation_template_id
    )

    const evalTemplates = await prisma.evaluation_templates.findMany({
      where: {
        id: {
          in: evaluationTemplateIds as number[],
        },
      },
    })

    res.json(evalTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
