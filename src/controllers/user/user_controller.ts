import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"
import { sendMail } from "../../services/mail_service"
import { EvaluationStatus } from "../../types/evaluationType"

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
