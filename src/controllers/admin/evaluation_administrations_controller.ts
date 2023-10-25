import { type Request, type Response } from "express"
import { createEvaluationSchema } from "../../utils/validation/evaluations/createEvaluationSchema"
import { ValidationError } from "yup"
import prisma from "../../utils/prisma"

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

    const evaluation = await prisma.evaluation_administrations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (
      evaluation?.status === "draft" &&
      (evaluation.name !== null ||
        evaluation.eval_period_start_date !== null ||
        eval_period_end_date !== null ||
        evaluation.email_subject !== null ||
        evaluation.email_content !== null)
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

    const updatedEvaluation = await prisma.evaluation_administrations.update({
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

    res.json(updatedEvaluation)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

// TODO: Move
export const createEvaluees = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { employee_ids } = req.body

    const employeeIds = employee_ids as number[]

    if (employeeIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Must have at least 1 employee selected" })
    }

    const currentDate = new Date()

    const data = employeeIds.map((employeeId) => {
      return {
        evaluation_administration_id: parseInt(id),
        user_id: employeeId,
        status: "pending",
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
          id: parseInt(id),
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

          await prisma.evaluations.create({
            data: {
              evaluation_template_id: evaluationTemplate?.id,
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
              status: "draft",
            },
          })
        })
      })

      hrEvaluators.forEach(async (hr) => {
        await prisma.evaluations.create({
          data: {
            evaluation_template_id: hrTemplate?.id,
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
            status: "draft",
          },
        })
      })
    })

    res.json(employee_ids)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
