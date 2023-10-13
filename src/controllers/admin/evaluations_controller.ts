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

export const getEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluation = await prisma.evaluation_administrations.findUnique({
      where: {
        id: Number(id),
      },
    })
    res.json(evaluation)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const setEvaluators = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { employee_ids } = req.body

    // TODO: validate ??
    // id           - evaluation_administrations
    // employee_ids - users

    const employeeIds = employee_ids as number[]

    const data = employeeIds.map((employeeId) => {
      return {
        evaluation_administration_id: Number(id),
        user_id: employeeId,
      }
    })

    await prisma.evaluation_results.createMany({
      data,
    })

    res.json(employee_ids)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
