import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { EvaluationResultStatus } from "../../types/evaluation-result-type"
import { EvaluationStatus } from "../../types/evaluation-type"
import { Decimal } from "@prisma/client/runtime/library"
import CustomError from "../../utils/custom-error"
import * as EvaluationResultService from "../../services/evaluation-result-service"

/**
 * List evaluation results based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.name - Filter by name.
 * @param req.query.status - Filter by status.
 * @param req.query.score_ratings_id - Filter by score ratings id.
 * @param req.query.banding - Filter by banding.
 * @param req.query.sort_by - Filter by sort_by.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_administration_id, name, status, score_ratings_id, banding, sort_by, page } =
      req.query
    const evaluationResults = await EvaluationResultService.getAllByFilters(
      user,
      evaluation_administration_id as string,
      name as string,
      status as string,
      score_ratings_id as string,
      banding as string,
      sort_by as string,
      page as string
    )
    res.json(evaluationResults)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message, data: error.data })
    }
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
      return res.status(400).json({ message: "Must have at least 1 employee selected" })
    }

    const evaluationAdministration = await prisma.evaluation_administrations.findUnique({
      where: {
        id: parseInt(evaluation_administration_id as string),
      },
    })

    if (evaluationAdministration === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    const evaluationResults = await prisma.evaluation_results.findMany({
      select: {
        user_id: true,
      },
      where: {
        evaluation_administration_id: parseInt(evaluation_administration_id as string),
      },
    })

    const newEmployeeIds = employeeIds.filter((employeeId) => {
      const evaluationResult = evaluationResults.find(
        (evaluationResult) => evaluationResult.user_id === employeeId
      )
      return evaluationResult === undefined ? employeeId : null
    })

    const currentDate = new Date()

    const data = newEmployeeIds.map((employeeId) => {
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

    const newEvaluationResults = await prisma.evaluation_results.findMany({
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
        user_id: {
          in: newEmployeeIds,
        },
      },
    })

    const bodTemplates = await prisma.evaluation_templates.findMany({
      where: {
        evaluator_role_id: 1,
      },
    })

    const hrTemplates = await prisma.evaluation_templates.findMany({
      where: {
        evaluator_role_id: 2,
      },
    })

    const employeeTemplates = await prisma.evaluation_templates.findMany({
      where: {
        evaluee_role_id: 2,
      },
    })

    const bodEvaluators = await prisma.user_details.findMany({
      select: {
        user_id: true,
      },
      where: {
        user_type: "bod",
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

    const employeeEvaluators = await prisma.users.findMany({
      select: {
        id: true,
      },
      where: {
        is_active: true,
      },
    })

    newEvaluationResults.forEach(async (evaluationResult) => {
      const evalueeId = evaluationResult.users?.id

      const projects = await prisma.project_members.findMany({
        where: {
          user_id: evalueeId,
          OR: [
            {
              start_date: {
                gte: evaluationAdministration.eval_period_start_date ?? new Date(),
                lte: evaluationAdministration.eval_period_end_date ?? new Date(),
              },
            },
            {
              end_date: {
                gte: evaluationAdministration.eval_period_start_date ?? new Date(),
                lte: evaluationAdministration.eval_period_end_date ?? new Date(),
              },
            },
            {
              start_date: { lte: evaluationAdministration.eval_period_start_date ?? new Date() },
              end_date: { gte: evaluationAdministration.eval_period_end_date ?? new Date() },
            },
            {
              start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
              end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
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
        submission_method: null
        is_external: boolean
        created_at: Date
        updated_at: Date
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
                  gte: evaluationAdministration.eval_period_start_date ?? new Date(),
                  lte: evaluationAdministration.eval_period_end_date ?? new Date(),
                },
              },
              {
                end_date: {
                  gte: evaluationAdministration.eval_period_start_date ?? new Date(),
                  lte: evaluationAdministration.eval_period_end_date ?? new Date(),
                },
              },
              {
                start_date: { lte: evaluationAdministration.eval_period_start_date ?? new Date() },
                end_date: { gte: evaluationAdministration.eval_period_end_date ?? new Date() },
              },
              {
                start_date: { gte: evaluationAdministration.eval_period_start_date ?? new Date() },
                end_date: { lte: evaluationAdministration.eval_period_end_date ?? new Date() },
              },
            ],
          },
          distinct: ["project_id", "user_id", "project_role_id"],
        })

        for (const member of members) {
          const evaluatorRoleId = member.project_role_id

          const evaluationTemplate = await prisma.evaluation_templates.findFirst({
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
              eval_start_date:
                (project.start_date ?? 0) < (evaluationAdministration.eval_period_start_date ?? 0)
                  ? evaluationAdministration.eval_period_start_date
                  : project.start_date,
              eval_end_date:
                (project.end_date ?? 0) > (evaluationAdministration.eval_period_end_date ?? 0)
                  ? evaluationAdministration.eval_period_end_date
                  : project.end_date,
              percent_involvement: project.allocation_rate,
              status: EvaluationStatus.Excluded,
              submission_method: null,
              is_external: false,
              created_at: currentDate,
              updated_at: currentDate,
            })

            const evaluationResultDetail = evaluationResultDetails.find(
              (evaluationResultDetail) =>
                evaluationResultDetail.evaluation_template_id === evaluationTemplate.id
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

        if (roleId === 3) {
          for (const bodTemplate of bodTemplates) {
            for (const bodEvaluator of bodEvaluators) {
              evaluations.push({
                evaluation_template_id: bodTemplate.id,
                evaluation_administration_id: evaluationAdministration.id,
                evaluation_result_id: evaluationResult.id,
                evaluator_id: bodEvaluator.user_id,
                evaluee_id: evalueeId,
                project_id: projectId,
                project_member_id: project.id,
                for_evaluation: false,
                eval_start_date:
                  (project.start_date ?? 0) < (evaluationAdministration.eval_period_start_date ?? 0)
                    ? evaluationAdministration.eval_period_start_date
                    : project.start_date,
                eval_end_date:
                  (project.end_date ?? 0) > (evaluationAdministration.eval_period_end_date ?? 0)
                    ? evaluationAdministration.eval_period_end_date
                    : project.end_date,
                percent_involvement: project.allocation_rate,
                status: EvaluationStatus.Excluded,
                submission_method: null,
                is_external: false,
                created_at: currentDate,
                updated_at: currentDate,
              })
            }

            evaluationResultDetails.push({
              evaluation_administration_id: evaluationAdministration.id,
              user_id: evalueeId,
              evaluation_result_id: evaluationResult.id,
              evaluation_template_id: bodTemplate.id,
              weight: bodTemplate.rate,
              created_at: currentDate,
              updated_at: currentDate,
            })
          }
        }
      }

      const isHr = await prisma.user_roles.findFirst({
        where: {
          name: "khv2_hr_evaluators",
          user_id: evalueeId,
        },
      })

      if (isHr === null) {
        for (const hrTemplate of hrTemplates) {
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
              status: EvaluationStatus.Excluded,
              submission_method: null,
              is_external: false,
              created_at: currentDate,
              updated_at: currentDate,
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
      } else {
        for (const employeeTemplate of employeeTemplates) {
          for (const employeeEvaluator of employeeEvaluators) {
            if (employeeEvaluator.id !== evalueeId) {
              evaluations.push({
                evaluation_template_id: employeeTemplate.id,
                evaluation_administration_id: evaluationAdministration.id,
                evaluation_result_id: evaluationResult.id,
                evaluator_id: employeeEvaluator.id,
                evaluee_id: evalueeId,
                project_id: null,
                project_member_id: null,
                for_evaluation: false,
                eval_start_date: evaluationAdministration.eval_period_start_date,
                eval_end_date: evaluationAdministration.eval_period_end_date,
                percent_involvement: new Decimal(100),
                status: EvaluationStatus.Excluded,
                submission_method: null,
                is_external: false,
                created_at: currentDate,
                updated_at: currentDate,
              })
            }
          }

          evaluationResultDetails.push({
            evaluation_administration_id: evaluationAdministration.id,
            user_id: evalueeId,
            evaluation_result_id: evaluationResult.id,
            evaluation_template_id: employeeTemplate.id,
            weight: employeeTemplate.rate,
            created_at: currentDate,
            updated_at: currentDate,
          })
        }
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
    const evaluationResult = await EvaluationResultService.getById(parseInt(id))

    res.json(evaluationResult)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message, data: error.data })
    }
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

    const updateEvaluationResult = await EvaluationResultService.updateStatusById(
      parseInt(id),
      status as string
    )

    res.json(updateEvaluationResult)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message, data: error.data })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List evaluation result ids based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 */
export const all = async (req: Request, res: Response) => {
  try {
    const { evaluation_administration_id } = req.query

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
        evaluation_administration_id: parseInt(evaluation_administration_id as string),
      },
    })

    res.json(evaluationResults)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
