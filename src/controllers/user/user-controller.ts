import { type Request, type Response } from "express"
import { EvaluationStatus } from "../../types/evaluation-type"
import { sendMail } from "../../utils/sendgrid"
import { ValidationError } from "yup"
import { submitEvaluationSchema } from "../../utils/validation/evaluations/submit-evaluation-schema"
import * as EvaluationService from "../../services/evaluation-service"
import * as EvaluationRatingService from "../../services/evaluation-rating-service"
import * as UserService from "../../services/user-service"
import * as AnswerOptionService from "../../services/answer-option-service"
import CustomError from "../../utils/custom-error"

/**
 * List user evaluations based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_administration_id, for_evaluation } = req.query

    const result = await EvaluationService.getUserEvaluations(
      user,
      parseInt(evaluation_administration_id as string),
      Boolean(parseInt(for_evaluation as string))
    )

    res.json(result)
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

    const evaluationAdministrations = await UserService.getEvaluationAdministrations(
      user,
      parseInt(page as string)
    )

    res.json(evaluationAdministrations)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Save answers and comments by ID
 * @param req.params.id - The unique ID of the evaluation.
 * @param req.body.evaluation_rating_ids - Evaluation rating ids.
 * @param req.body.evaluation_rating_comments - Evaluation rating comments.
 * @param req.body.answer_option_ids - Answer option ids.
 * @param req.body.comment - Evaluation comment.
 * @param req.body.is_submitting - Flag to check if user is submitting.
 */

export const submitEvaluation = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const {
      evaluation_rating_ids,
      evaluation_rating_comments,
      answer_option_ids,
      comment,
      is_submitting,
    } = req.body

    const evaluation = await UserService.submitEvaluation(
      parseInt(id),
      user,
      answer_option_ids as number[],
      evaluation_rating_ids as number[],
      comment,
      evaluation_rating_comments as string[],
      is_submitting
    )

    res.json({ id, status: evaluation?.status, comment })
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
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
