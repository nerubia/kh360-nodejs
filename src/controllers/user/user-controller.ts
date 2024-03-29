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
import logger from "../../utils/logger"

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
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List user evaluation administrations (as evaluee)
 * @param req.query.page - Page number for pagination.
 */
export const getEvaluationAdministrationsAsEvaluee = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { page } = req.query

    const evaluationAdministrations = await UserService.getEvaluationAdministrationsAsEvaluee(
      user,
      parseInt(page as string)
    )

    res.json(evaluationAdministrations)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific user evaluation result by evaluation administration ID.
 * @param req.params.id - The unique ID of the evaluation result.
 */
export const getUserEvaluationResult = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params

    const evaluationResult = await UserService.getEvaluationResult(user, parseInt(id))

    res.json(evaluationResult)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
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
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Send email to request for removal of evaluation
 * @param req.params.id - The unique id of the evaluation.
 * @param req.body.comment - Evaluation comment.
 */
export const sendRequestToRemove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { comment } = req.body

    await UserService.sendRequestToRemove(parseInt(id), comment as string)

    res.json({ id, status: EvaluationStatus.ForRemoval })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
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
      recommendation,
      is_submitting,
    } = req.body

    const evaluation = await UserService.submitEvaluation(
      parseInt(id),
      user,
      answer_option_ids as number[],
      evaluation_rating_ids as number[],
      comment,
      recommendation,
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
    logger.error(error)
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
    logger.error(error)
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
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List user survey administrations
 * @param req.query.page - Page number for pagination.
 */
export const getSurveyAdministrations = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { page } = req.query

    const surveyAdministrations = await UserService.getSurveyAdministrations(
      user,
      parseInt(page as string)
    )

    res.json(surveyAdministrations)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List user survey questions
 * @param req.query.survey_administration_id - The unique ID of the survey administration.
 * @param req.query.page - Page number for pagination.
 */
export const getSurveyQuestions = async (req: Request, res: Response) => {
  try {
    const { survey_administration_id } = req.query
    const user = req.user

    const surveyQuestions = await UserService.getSurveyQuestions(
      parseInt(survey_administration_id as string),
      user
    )

    res.json(surveyQuestions)
  } catch (error) {
    logger.error(error)
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Save answers and comments by ID
 * @param req.params.id - The unique ID of the survey result.
 * @param req.body.survey_answers - Survey answers.
 * @param req.body.comment - Survey comment.
 */

export const submitSurveyAnswers = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { survey_answers } = req.body

    await UserService.submitSurveyAnswers(parseInt(id), user, survey_answers)

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
