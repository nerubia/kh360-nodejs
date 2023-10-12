import { type Request, type Response } from "express"
import { createEvaluationSchema } from "../../utils/validation/evaluations/createEvaluationSchema"
import { ValidationError } from "yup"
import prisma from "../../utils/prisma"

export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const evaluations = await prisma.evaluation_administrations.findMany()
    res.json(evaluations)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const createEvaluation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
    } = req.body

    await createEvaluationSchema.validate({
      name,
      eval_period_start_date,
      eval_period_end_date,
      eval_schedule_start_date,
      eval_schedule_end_date,
      remarks,
    })

    const newEvaluation = await prisma.evaluation_administrations.create({
      data: {
        name,
        eval_period_start_date: new Date(eval_period_start_date),
        eval_period_end_date: new Date(eval_period_end_date),
        eval_schedule_start_date: new Date(eval_schedule_start_date),
        eval_schedule_end_date: new Date(eval_schedule_end_date),
        remarks,
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
