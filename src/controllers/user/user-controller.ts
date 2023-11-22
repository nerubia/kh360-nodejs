import { type Request, type Response } from "express"
import { differenceInDays, endOfYear, startOfYear } from "date-fns"
import { EvaluationStatus } from "../../types/evaluation-type"
import { EvaluationAdministrationStatus } from "../../types/evaluation-administration-type"
import { sendMail } from "../../utils/sendgrid"
import { ValidationError } from "yup"
import { submitEvaluationSchema } from "../../utils/validation/evaluations/submit-evaluation-schema"
import * as EvaluationService from "../../services/evaluation-service"
import * as EvaluationResultService from "../../services/evaluation-result-service"
import * as EvaluationTemplateService from "../../services/evaluation-template-service"
import * as EvaluationAdministrationService from "../../services/evaluation-administration-service"
import * as EvaluationRatingService from "../../services/evaluation-rating-service"
import * as EvaluationResultDetailService from "../../services/evaluation-result-detail-service"
import * as UserService from "../../services/user-service"
import * as ProjectService from "../../services/project-service"
import * as ProjectRoleService from "../../services/project-role-service"
import * as AnswerOptionService from "../../services/answer-option-service"

/**
 * List user evaluations based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_administration_id, for_evaluation } = req.query

    const evaluations = await EvaluationService.getAllByFilters({
      evaluation_administration_id: parseInt(evaluation_administration_id as string),
      evaluator_id: user.id,
      for_evaluation: Boolean(parseInt(for_evaluation as string)),
      status: {
        in: [EvaluationStatus.Open, EvaluationStatus.Ongoing, EvaluationStatus.Submitted],
      },
    })

    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator = await UserService.getById(evaluation.evaluator_id ?? 0)
        const evaluee = await UserService.getById(evaluation.evaluee_id ?? 0)
        const project = await ProjectService.getById(evaluation.project_id ?? 0)
        const projectRole = await ProjectRoleService.getById(
          evaluation.project_members?.project_role_id ?? 0
        )

        let template = null

        if (project === null) {
          template = await EvaluationTemplateService.getById(evaluation.evaluation_template_id ?? 0)
          if (template?.evaluee_role_id !== null) {
            const project_role = await ProjectRoleService.getById(template?.evaluee_role_id ?? 0)
            Object.assign(template ?? 0, {
              project_role,
            })
          }
        }

        return {
          id: evaluation.id,
          comments: evaluation.comments,
          eval_start_date: evaluation.eval_start_date,
          eval_end_date: evaluation.eval_end_date,
          percent_involvement: evaluation.percent_involvement,
          status: evaluation.status,
          for_evaluation: evaluation.for_evaluation,
          evaluator,
          evaluee,
          project,
          project_role: projectRole,
          template,
        }
      })
    )

    res.json(finalEvaluations)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List user evaluation administrations
 * @param req.query.page - Page number for pagination.
 */
export const getEvaluationAdministrations = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { page } = req.query

    const itemsPerPage = 20
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const evaluations = await EvaluationService.getAllByFilters({
      evaluator_id: user.id,
      for_evaluation: true,
    })

    const evaluationAdministrationIds = evaluations.map(
      (evaluation) => evaluation.evaluation_administration_id
    )

    const evaluationAdministrations = await EvaluationAdministrationService.getAllByFilters(
      (currentPage - 1) * itemsPerPage,
      itemsPerPage,
      {
        id: {
          in: evaluationAdministrationIds as number[],
        },
        status: EvaluationAdministrationStatus.Ongoing,
      }
    )

    const finalEvaluationAdministrations = await Promise.all(
      evaluationAdministrations.map(async (evaluationAdministration) => {
        const totalEvaluations = await EvaluationService.countAllByFilters({
          evaluator_id: user.id,
          for_evaluation: true,
          evaluation_administration_id: evaluationAdministration.id,
        })

        const totalSubmitted = await EvaluationService.countAllByFilters({
          evaluator_id: user.id,
          for_evaluation: true,
          evaluation_administration_id: evaluationAdministration.id,
          status: EvaluationStatus.Submitted,
        })

        const totalPending = await EvaluationService.countAllByFilters({
          evaluator_id: user.id,
          for_evaluation: true,
          evaluation_administration_id: evaluationAdministration.id,
          status: {
            in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
          },
        })

        return {
          id: evaluationAdministration.id,
          name: evaluationAdministration.name,
          eval_period_start_date: evaluationAdministration.eval_period_start_date,
          eval_period_end_date: evaluationAdministration.eval_period_end_date,
          eval_schedule_start_date: evaluationAdministration.eval_schedule_start_date,
          eval_schedule_end_date: evaluationAdministration.eval_schedule_end_date,
          remarks: evaluationAdministration.remarks,
          totalEvaluations,
          totalSubmitted,
          totalPending,
        }
      })
    )

    const totalItems = await EvaluationAdministrationService.countAllByFilters({
      id: {
        in: evaluationAdministrationIds as number[],
      },
      status: EvaluationAdministrationStatus.Ongoing,
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: finalEvaluationAdministrations,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        currentPage,
        totalPages,
        totalItems,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Save answers and comments by ID
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.evaluation_rating_ids - Evaluation rating ids.
 * @param req.body.answer_option_ids - Answer option ids.
 * @param req.body.comment - Evaluation comment.
 * @param req.body.is_submitting - Flag to check if user is submitting.
 */

export const submitEvaluation = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { evaluation_rating_ids, answer_option_ids, comment, is_submitting } = req.body

    const evaluationRatingIds = evaluation_rating_ids as number[]
    const answerOptionIds = answer_option_ids as number[]

    const evaluation = await EvaluationService.getById(parseInt(id))

    await submitEvaluationSchema.validate(
      {
        evaluation,
      },
      { context: { user } }
    )

    const evaluationRatings = await EvaluationRatingService.getAllByFilters({
      id: {
        in: evaluationRatingIds,
      },
    })

    if (evaluation !== null) {
      await EvaluationService.updateById(evaluation.id, {
        comments: comment,
        status: EvaluationStatus.Ongoing,
        updated_at: new Date(),
      })
    }

    for (const [index, evaluationRating] of evaluationRatings.entries()) {
      const answerOptionId = answerOptionIds[index]
      const answerOption = await AnswerOptionService.getById(answerOptionId ?? 0)

      const rate = Number(answerOption?.rate ?? 0)
      const percentage = Number(evaluationRating.percentage ?? 0)
      const score = rate * percentage

      if (answerOption?.id !== undefined) {
        await EvaluationRatingService.updateById(evaluationRating.id, {
          answer_option_id: answerOption?.id,
          rate,
          score,
          updated_at: new Date(),
        })
      }
    }

    if (is_submitting === true && evaluation !== null) {
      await submitEvaluationSchema.validate({
        answerOptionIds,
        comment,
      })
      const evaluationRatings = await EvaluationRatingService.aggregateSumByEvaluationId(
        evaluation.id,
        {
          score: true,
          percentage: true,
        }
      )

      const score = (
        Number(evaluationRatings._sum.score) / Number(evaluationRatings._sum.percentage)
      ).toFixed(2)

      const totalEvaluationDays =
        differenceInDays(
          new Date(evaluation.eval_end_date ?? 0),
          new Date(evaluation.eval_start_date ?? 0)
        ) + 1

      const currentDate = new Date()
      const totalDaysInAYear =
        differenceInDays(endOfYear(currentDate), startOfYear(currentDate)) + 1

      const weight =
        (totalEvaluationDays / totalDaysInAYear) * Number(evaluation.percent_involvement)

      const weighted_score = weight * Number(score)

      await EvaluationService.updateById(evaluation.id, {
        score,
        weight,
        weighted_score,
        status: EvaluationStatus.Submitted,
        submission_method: "Manual",
        submitted_date: currentDate,
        updated_at: currentDate,
      })

      const remainingEvaluations = await EvaluationService.countAllByFilters({
        evaluation_result_id: evaluation.evaluation_result_id,
        status: {
          in: [
            EvaluationStatus.Draft,
            EvaluationStatus.Pending,
            EvaluationStatus.Open,
            EvaluationStatus.Ongoing,
          ],
        },
      })

      if (remainingEvaluations === 0 && evaluation.evaluation_result_id !== null) {
        await EvaluationResultDetailService.calculateScore(evaluation.evaluation_result_id)
        await EvaluationResultService.calculateScore(evaluation.evaluation_result_id)
      }

      Object.assign(evaluation, {
        status: EvaluationStatus.Submitted,
      })
    }

    res.json({ id, status: evaluation?.status, comment })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Submit answer by ID
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.evaluation_rating_id - Evaluation rating id.
 * @param req.body.answer_option_id - Answer optioin id.
 */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { evaluation_rating_id, answer_option_id } = req.body

    const evaluation = await EvaluationService.getById(parseInt(id))

    const evaluationRating = await EvaluationRatingService.getById(
      parseInt(evaluation_rating_id as string)
    )

    await submitEvaluationSchema.validate(
      {
        answerOptionIds: [answer_option_id],
        evaluation,
      },
      { context: { user } }
    )

    const answerOption = await AnswerOptionService.getById(parseInt(answer_option_id as string))

    if (evaluation?.status === EvaluationStatus.Open) {
      await EvaluationService.updateById(evaluation.id, {
        status: EvaluationStatus.Ongoing,
        updated_at: new Date(),
      })

      Object.assign(evaluation, {
        status: EvaluationStatus.Ongoing,
      })
    }

    const rate = Number(answerOption?.rate ?? 0)
    const percentage = Number(evaluationRating?.percentage ?? 0)
    const score = rate * percentage

    if (evaluationRating !== null) {
      await EvaluationRatingService.updateById(evaluationRating.id, {
        answer_option_id: answerOption?.id ?? 0,
        rate,
        score,
        updated_at: new Date(),
      })
    }

    res.json({ id, status: evaluation?.status })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Submit comment by ID
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.comment - Evaluation comment.
 */
export const submitComment = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { comment } = req.body

    const evaluation = await EvaluationService.getById(parseInt(id))

    await submitEvaluationSchema.validate(
      {
        evaluation,
        comment,
      },
      { context: { user } }
    )

    if (evaluation !== null) {
      await EvaluationService.updateById(evaluation.id, {
        comments: comment,
        status: EvaluationStatus.Ongoing,
        updated_at: new Date(),
      })
    }

    res.json({ id, comment })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

// TODO: Refactor
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const userData = await UserService.getById(user.id)

    res.json(userData)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

// TODO: Remove
export const sendSampleMail = async (req: Request, res: Response) => {
  try {
    const user = req.user
    await sendMail(user.email, "Sample subject", "Hello")
    res.json({
      message: "Mail sent",
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
