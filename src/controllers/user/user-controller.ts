import { type Request, type Response } from "express"
import { differenceInDays, endOfYear, startOfYear } from "date-fns"
import prisma from "../../utils/prisma"
import { EvaluationStatus } from "../../types/evaluation-type"
import { EvaluationResultStatus } from "../../types/evaluationResultType"
import { EvaluationAdministrationStatus } from "../../types/evaluation-administration-type"
import { sendMail } from "../../utils/sendgrid"

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
        evaluation_administration_id: parseInt(evaluation_administration_id as string),
        evaluator_id: user.id,
        for_evaluation: Boolean(parseInt(for_evaluation as string)),
        status: {
          in: [EvaluationStatus.Open, EvaluationStatus.Ongoing, EvaluationStatus.Submitted],
        },
      },
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
            id: evaluation.evaluator_id ?? 0,
          },
        })
        const evaluee = await prisma.users.findUnique({
          select: {
            id: true,
            slug: true,
            first_name: true,
            last_name: true,
            picture: true,
          },
          where: {
            id: evaluation.evaluee_id ?? 0,
          },
        })
        const project = await prisma.projects.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: evaluation.project_id ?? 0,
          },
        })
        const projectRole = await prisma.project_roles.findUnique({
          select: {
            id: true,
            name: true,
            short_name: true,
          },
          where: {
            id: evaluation.project_members?.project_role_id ?? 0,
          },
        })
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

    const evaluations = await prisma.evaluations.findMany({
      where: {
        evaluator_id: user.id,
        for_evaluation: true,
      },
    })

    const evaluationAdministrationIds = evaluations.map(
      (evaluation) => evaluation.evaluation_administration_id
    )

    const evaluationAdministrations = await prisma.evaluation_administrations.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      where: {
        id: {
          in: evaluationAdministrationIds as number[],
        },
        status: EvaluationAdministrationStatus.Ongoing,
      },
      orderBy: {
        id: "desc",
      },
    })

    const finalEvaluationAdministrations = await Promise.all(
      evaluationAdministrations.map(async (evaluationAdministration) => {
        const totalEvaluations = await prisma.evaluations.count({
          where: {
            evaluator_id: user.id,
            for_evaluation: true,
            evaluation_administration_id: evaluationAdministration.id,
          },
        })

        const totalSubmitted = await prisma.evaluations.count({
          where: {
            evaluator_id: user.id,
            for_evaluation: true,
            evaluation_administration_id: evaluationAdministration.id,
            status: EvaluationStatus.Submitted,
          },
        })

        const totalPending = await prisma.evaluations.count({
          where: {
            evaluator_id: user.id,
            for_evaluation: true,
            evaluation_administration_id: evaluationAdministration.id,
            status: {
              in: [EvaluationStatus.Open, EvaluationStatus.Ongoing],
            },
          },
        })

        return {
          id: evaluationAdministration.id,
          name: evaluationAdministration.name,
          eval_period_start_date: evaluationAdministration.eval_period_start_date,
          eval_period_end_date: evaluationAdministration.eval_period_end_date,
          eval_schedule_start_date: evaluationAdministration.eval_schedule_start_date,
          eval_schedule_end_date: evaluationAdministration.eval_schedule_end_date,
          totalEvaluations,
          totalSubmitted,
          totalPending,
        }
      })
    )

    const totalItems = await prisma.evaluation_administrations.count({
      where: {
        id: {
          in: evaluationAdministrationIds as number[],
        },
        status: EvaluationAdministrationStatus.Ongoing,
      },
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: finalEvaluationAdministrations,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
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
 */

export const saveAnswers = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params
    const { evaluation_rating_ids, answer_option_ids, comment } = req.body

    const evaluationRatingIds = evaluation_rating_ids as number[]
    const answerOptionIds = answer_option_ids as number[]

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

    const evaluationRatings = await prisma.evaluation_ratings.findMany({
      where: {
        id: {
          in: evaluationRatingIds,
        },
      },
    })

    if (evaluation.status === EvaluationStatus.Open) {
      await prisma.evaluations.update({
        where: {
          id: evaluation.id,
        },
        data: {
          status: EvaluationStatus.Ongoing,
        },
      })
      Object.assign(evaluation, {
        status: EvaluationStatus.Ongoing,
      })
    }

    evaluationRatings.forEach(async (rating, index) => {
      const answerOptionId = answerOptionIds[index]
      const answerOption = await prisma.answer_options.findUnique({
        where: {
          id: answerOptionId ?? 0,
        },
      })

      const rate = Number(answerOption?.rate ?? 0)
      const percentage = Number(rating.percentage ?? 0)
      const score = rate * percentage

      await prisma.evaluation_ratings.updateMany({
        where: {
          id: rating.id,
        },
        data: {
          answer_option_id: answerOption?.id,
          rate,
          score,
        },
      })
    })

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

    res.json({ id, status: evaluation.status, comment })
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

    const allEvaluationRatings = await prisma.evaluation_ratings.findMany({
      select: {
        answer_option_id: true,
      },
      where: {
        evaluation_id: evaluation?.id,
      },
    })

    const containsNullAnswerOption = allEvaluationRatings.some(
      (rating) => rating.answer_option_id === null
    )

    if (containsNullAnswerOption) {
      return res.status(400).json({ message: "Please set all ratings." })
    }

    const answerOptionIds = allEvaluationRatings
      .map((rating) => rating.answer_option_id)
      .filter((id) => id !== null) as number[]

    const answerOptions = await prisma.answer_options.findMany({
      select: {
        sequence_no: true,
      },
      where: {
        id: {
          in: answerOptionIds,
        },
      },
    })

    if (
      answerOptions.every((rating) => rating.sequence_no === 2) &&
      (evaluation?.comments?.trim().length === 0 || evaluation?.comments === null)
    ) {
      return res.status(400).json({ message: "Comment is required." })
    }

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
      Number(evaluationRatings._sum.score) / Number(evaluationRatings._sum.percentage)
    ).toFixed(2)

    const evalStartDate =
      evaluation.eval_start_date != null ? new Date(evaluation.eval_start_date).getTime() : 0
    const evalEndDate =
      evaluation.eval_end_date != null ? new Date(evaluation.eval_end_date).getTime() : 0

    const totalEvaluationDays = Math.ceil((evalEndDate - evalStartDate) / (1000 * 60 * 60 * 24))

    const currentDate = new Date()
    const totalDaysInAYear = differenceInDays(endOfYear(currentDate), startOfYear(currentDate)) + 1

    const weight = (totalEvaluationDays / totalDaysInAYear) * Number(evaluation.percent_involvement)

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

    if (remainingEvaluations === 0 && evaluation.evaluation_result_id !== null) {
      const evaluationResultDetails = await prisma.evaluation_result_details.findMany({
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
            evaluation_template_id: evaluationResultDetail.evaluation_template_id,
            status: EvaluationStatus.Submitted,
          },
        })

        const score = Number(evaluations._sum.weighted_score) / Number(evaluations._sum.weight)

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

      const evaluationResultDetailsSum = await prisma.evaluation_result_details.aggregate({
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

    res.json({ id, status: EvaluationStatus.Submitted })
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
