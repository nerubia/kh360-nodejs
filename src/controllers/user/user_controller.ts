import { type Request, type Response } from "express"
import { differenceInDays, endOfYear, startOfYear } from "date-fns"
import prisma from "../../utils/prisma"
import { sendMail } from "../../services/mail_service"
import { EvaluationStatus } from "../../types/evaluationType"
import { EvaluationResultStatus } from "../../types/evaluationResultType"

/**
 * List user evaluations based on provided filters.
 * @param req.query.evaluation_administration_id - Filter by evaluation administration id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 */
export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_administration_id, for_evaluation } = req.query

    const evaluations = await prisma.evaluations.findMany({
      include: {
        project_members: {
          select: {
            project_role_id: true,
          },
        },
      },
      where: {
        evaluation_administration_id: parseInt(
          evaluation_administration_id as string
        ),
        evaluator_id: user.id,
        for_evaluation: Boolean(parseInt(for_evaluation as string)),
      },
      distinct: ["evaluator_id", "project_id"],
    })

    const finalEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator = await prisma.users.findUnique({
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
          where: {
            id: evaluation.evaluator_id ?? undefined,
          },
        })
        const evaluee = await prisma.users.findUnique({
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
          where: {
            id: evaluation.evaluee_id ?? undefined,
          },
        })
        const project = await prisma.projects.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_id ?? undefined,
          },
        })
        const projectRole = await prisma.project_roles.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_members?.project_role_id ?? undefined,
          },
        })
        return {
          id: evaluation.id,
          eval_start_date: evaluation.eval_start_date,
          eval_end_date: evaluation.eval_end_date,
          percent_involvement: evaluation.percent_involvement,
          status: evaluation.status,
          for_evaluation: evaluation.for_evaluation,
          evaluator,
          evaluee,
          project,
          project_role: projectRole,
        }
      })
    )

    res.json(finalEvaluations)
  } catch (error) {
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

    const evaluation = await prisma.evaluations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluation === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    if (evaluation.evaluator_id !== user.id) {
      return res.status(403).json({
        message: "You do not have permission to answer this.",
      })
    }

    if (
      evaluation.status !== EvaluationStatus.Open &&
      evaluation.status !== EvaluationStatus.Ongoing
    ) {
      return res.status(403).json({
        message: "Only open and ongoing statuses are allowed.",
      })
    }

    const evaluationRating = await prisma.evaluation_ratings.findUnique({
      where: {
        id: parseInt(evaluation_rating_id as string),
      },
    })

    if (evaluationRating === null) {
      return res.status(400).json({ message: "Evaluation rating not found" })
    }

    const answerOption = await prisma.answer_options.findUnique({
      where: {
        id: parseInt(answer_option_id as string),
      },
    })

    if (answerOption === null) {
      return res.status(400).json({ message: "Answer option not found" })
    }

    if (evaluation.status === EvaluationStatus.Open) {
      await prisma.evaluations.update({
        where: {
          id: evaluation.id,
        },
        data: {
          status: EvaluationStatus.Ongoing,
        },
      })
    }

    const rate = Number(answerOption.rate ?? 0)
    const percentage = Number(evaluationRating.percentage ?? 0)
    const score = rate * percentage

    await prisma.evaluation_ratings.update({
      where: {
        id: evaluationRating.id,
      },
      data: {
        answer_option_id: answerOption.id,
        rate,
        score,
      },
    })

    res.json({ id })
  } catch (error) {
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

    const evaluation = await prisma.evaluations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluation === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    if (evaluation.evaluator_id !== user.id) {
      return res.status(403).json({
        message: "You do not have permission to answer this.",
      })
    }

    if (
      evaluation.status !== EvaluationStatus.Open &&
      evaluation.status !== EvaluationStatus.Ongoing
    ) {
      return res.status(403).json({
        message: "Only open and ongoing statuses are allowed.",
      })
    }

    await prisma.evaluations.update({
      where: {
        id: evaluation.id,
      },
      data: {
        comments: comment,
        status: EvaluationStatus.Ongoing,
        updated_at: new Date(),
      },
    })

    res.json({ id })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Submit evaluation by ID
 * @param req.params.id - The unique ID of the evaluation.
 */
export const submitEvaluation = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params

    const evaluation = await prisma.evaluations.findUnique({
      where: {
        id: parseInt(id),
      },
    })

    if (evaluation === null) {
      return res.status(400).json({ message: "Invalid id" })
    }

    if (evaluation.evaluator_id !== user.id) {
      return res.status(403).json({
        message: "You do not have permission to answer this.",
      })
    }

    if (
      evaluation.status !== EvaluationStatus.Open &&
      evaluation.status !== EvaluationStatus.Ongoing
    ) {
      return res.status(403).json({
        message: "Only open and ongoing statuses are allowed.",
      })
    }

    const evaluationRatings = await prisma.evaluation_ratings.aggregate({
      _sum: {
        score: true,
        percentage: true,
      },
      where: {
        evaluation_id: evaluation.id,
      },
    })

    const score = (
      Number(evaluationRatings._sum.score) /
      Number(evaluationRatings._sum.percentage)
    ).toFixed(2)

    const evalStartDate =
      evaluation.eval_start_date != null
        ? new Date(evaluation.eval_start_date).getTime()
        : 0
    const evalEndDate =
      evaluation.eval_end_date != null
        ? new Date(evaluation.eval_end_date).getTime()
        : 0

    const totalEvaluationDays = Math.ceil(
      (evalEndDate - evalStartDate) / (1000 * 60 * 60 * 24)
    )

    const currentDate = new Date()
    const totalDaysInAYear =
      differenceInDays(endOfYear(currentDate), startOfYear(currentDate)) + 1

    const weight =
      (totalEvaluationDays / totalDaysInAYear) *
      Number(evaluation.percent_involvement)

    const weighted_score = weight * Number(score)

    await prisma.evaluations.update({
      where: {
        id: evaluation.id,
      },
      data: {
        score,
        weight,
        weighted_score,
        status: EvaluationStatus.Submitted,
        submission_method: "Manual",
        submitted_date: currentDate,
        updated_at: currentDate,
      },
    })

    const remainingEvaluations = await prisma.evaluations.count({
      where: {
        evaluation_result_id: evaluation.evaluation_result_id,
        status: {
          in: [
            EvaluationStatus.Draft,
            EvaluationStatus.Pending,
            EvaluationStatus.Open,
            EvaluationStatus.Ongoing,
          ],
        },
      },
    })

    if (
      remainingEvaluations === 0 &&
      evaluation.evaluation_result_id !== null
    ) {
      const evaluationResultDetails =
        await prisma.evaluation_result_details.findMany({
          where: {
            evaluation_result_id: evaluation.evaluation_result_id,
          },
        })

      for (const evaluationResultDetail of evaluationResultDetails) {
        const evaluations = await prisma.evaluations.aggregate({
          _sum: {
            weight: true,
            weighted_score: true,
          },
          where: {
            evaluation_result_id: evaluation.evaluation_result_id,
            evaluation_template_id:
              evaluationResultDetail.evaluation_template_id,
          },
        })

        const score =
          Number(evaluations._sum.weighted_score) /
          Number(evaluations._sum.weight)

        await prisma.evaluation_result_details.update({
          where: {
            id: evaluationResultDetail.id,
          },
          data: {
            score,
            weighted_score: Number(evaluationResultDetail.weight) * score,
            updated_at: currentDate,
          },
        })
      }

      const evaluationResultDetailsSum =
        await prisma.evaluation_result_details.aggregate({
          _sum: {
            weight: true,
            weighted_score: true,
          },
        })

      await prisma.evaluation_results.update({
        where: {
          id: evaluation.evaluation_result_id,
        },
        data: {
          score:
            Number(evaluationResultDetailsSum._sum.weighted_score) /
            Number(evaluationResultDetailsSum._sum.weight),
          status: EvaluationResultStatus.Completed,
          updated_at: currentDate,
        },
      })
    }

    res.json({ id })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

// TODO: Refactor
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const userData = await prisma.users.findUnique({
      where: {
        email: user.email,
      },
    })
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
