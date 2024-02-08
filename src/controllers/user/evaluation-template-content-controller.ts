import { type Request, type Response } from "express"
import * as EvaluationTemplateContentService from "../../services/evaluation-template-content-service"
import CustomError from "../../utils/custom-error"
import logger from "../../utils/logger"
import { createEvaluationTemplateContentSchema } from "../../utils/validation/evaluation-template-content-schema"
import { ValidationError } from "yup"

/**
 * Store a new evaluation template content.
 * @param req.body.evaluation_template_id - Unique id of evaluation template
 * @param req.body.name - Name.
 * @param req.body.description - Description.
 * @param req.body.category - Category.
 * @param req.body.rate - Rate.
 * @param req.body.is_active - Is active.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const { evaluation_template_id, name, description, category, rate, is_active } = req.body

    await createEvaluationTemplateContentSchema.validate({
      name,
      description,
      category,
      rate,
      is_active,
    })

    const newEvaluationTemplate = await EvaluationTemplateContentService.create(
      parseInt(evaluation_template_id as string),
      {
        name,
        description,
        category,
        rate,
        is_active,
      }
    )

    res.json(newEvaluationTemplate)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List evaluation template contents based on provided filters.
 * @param req.query.evaluation_id - Filter by evaluation id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { evaluation_id } = req.query

    const evaluationTemplateContents =
      await EvaluationTemplateContentService.getEvaluationTemplateContents(
        user,
        parseInt(evaluation_id as string)
      )

    res.json(evaluationTemplateContents)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing evaluation template content by ID.
 * @param req.params.id - The unique ID of the evaluation template content.
 * @param req.body.name - Name.
 * @param req.body.description - Description.
 * @param req.body.category - Category.
 * @param req.body.rate - Rate.
 * @param req.body.is_active - Is active.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { name, description, category, rate, is_active } = req.body

    await createEvaluationTemplateContentSchema.validate({
      name,
      description,
      category,
      rate,
      is_active,
    })

    const newEvaluationTemplate = await EvaluationTemplateContentService.updateById(parseInt(id), {
      name,
      description,
      category,
      rate,
      is_active,
    })

    res.json(newEvaluationTemplate)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific evaluation template content by ID.
 * @param req.params.id - The unique ID of the evaluation template content.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationTemplateContentService.deleteById(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
