import { type Request, type Response } from "express"
import * as EvaluationTemplateService from "../../services/evaluation-template-service"
import { createEvaluationTemplate } from "../../utils/validation/evaluation-template-schema"
import { ValidationError } from "yup"
import CustomError from "../../utils/custom-error"

/**
 * List active evaluation templates.
 */
export const active = async (req: Request, res: Response) => {
  try {
    const evaluationTemplates = await EvaluationTemplateService.getActiveTemplates()
    res.json(evaluationTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List evaluation template types
 */
export const getTemplateTypes = async (req: Request, res: Response) => {
  try {
    const evaluationTemplates = await EvaluationTemplateService.getTemplateTypes()
    res.json(evaluationTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List evaluation templates based on provided filters.
 * @param req.query.evaluation_result_id - Filter by evaluation result id.
 * @param req.query.for_evaluation - Filter by for_evaluation.
 * @param req.query.name - Filter by name.
 * @param req.query.display_name - Filter by display name.
 * @param req.query.template_type - Filter by template type.
 * @param req.query.evaluator_role_id - Filter by evaluator role id.
 * @param req.query.evaluee_role_id - Filter by evaluee role id.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const {
      evaluation_result_id,
      for_evaluation,
      name,
      display_name,
      template_type,
      evaluator_role_id,
      evaluee_role_id,
      page,
    } = req.query
    const evaluationTemplates = await EvaluationTemplateService.getAllByFilters(
      evaluation_result_id as string,
      for_evaluation as string,
      name as string,
      display_name as string,
      template_type as string,
      parseInt(evaluator_role_id as string),
      parseInt(evaluee_role_id as string),
      page as string
    )
    res.json(evaluationTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new evaluation template.
 * @param req.body.name - Name.
 * @param req.body.display_name - Display name.
 * @param req.body.template_type - Template type.
 * @param req.body.template_class - Template class.
 * @param req.body.with_recommendation - With recommendation.
 * @param req.body.evaluator_role_id - Evaluator role id.
 * @param req.body.evaluee_role_id - Evaluee role id.
 * @param req.body.rate - Rate.
 * @param req.body.answer_id - Answer id.
 * @param req.body.description - Description.
 * @param req.body.is_active - Is active.
 * @param req.body.evaluation_template_contents - Evaluation template contents.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      display_name,
      template_type,
      template_class,
      with_recommendation,
      evaluator_role_id,
      evaluee_role_id,
      rate,
      answer_id,
      description,
      is_active,
      evaluation_template_contents,
    } = req.body

    await createEvaluationTemplate.validate({
      name,
      display_name,
      template_type,
      template_class,
      with_recommendation,
      evaluator_role_id,
      evaluee_role_id,
      rate,
      answer_id,
      description,
      is_active,
      evaluation_template_contents,
    })

    const newEvaluationTemplate = await EvaluationTemplateService.create(
      {
        name,
        display_name,
        template_type,
        template_class,
        with_recommendation: Boolean(parseInt(with_recommendation)),
        evaluator_role_id: parseInt(evaluator_role_id),
        evaluee_role_id: parseInt(evaluee_role_id),
        rate,
        answer_id: parseInt(answer_id),
        description,
        is_active: Boolean(parseInt(is_active)),
      },
      evaluation_template_contents
    )

    res.json(newEvaluationTemplate)
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
 * Get a specific evaluation template by ID.
 * @param req.params.id - The unique ID of the evaluation template.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const evaluationTemplate = await EvaluationTemplateService.getById(parseInt(id))
    res.json(evaluationTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing evaluation template by ID.
 * @param req.params.id - The unique ID of the evaluation template.
 * @param req.body.name - Name.
 * @param req.body.display_name - Display name.
 * @param req.body.template_type - Template type.
 * @param req.body.template_class - Template class.
 * @param req.body.with_recommendation - With recommendation.
 * @param req.body.evaluator_role_id - Evaluator role id.
 * @param req.body.evaluee_role_id - Evaluee role id.
 * @param req.body.rate - Rate.
 * @param req.body.answer_id - Answer id.
 * @param req.body.description - Description.
 * @param req.body.is_active - Is active.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const {
      name,
      display_name,
      template_type,
      template_class,
      with_recommendation,
      evaluator_role_id,
      evaluee_role_id,
      rate,
      answer_id,
      description,
      is_active,
      evaluation_template_contents,
    } = req.body

    await createEvaluationTemplate.validate({
      name,
      display_name,
      template_type,
      template_class,
      with_recommendation,
      evaluator_role_id,
      evaluee_role_id,
      rate,
      answer_id,
      description,
      is_active,
      evaluation_template_contents,
    })

    const newEvaluationTemplate = await EvaluationTemplateService.updateById(
      parseInt(id),
      {
        name,
        display_name,
        template_type,
        template_class,
        with_recommendation: Boolean(parseInt(with_recommendation)),
        evaluator_role_id: parseInt(evaluator_role_id),
        evaluee_role_id: parseInt(evaluee_role_id),
        rate,
        answer_id: parseInt(answer_id),
        description,
        is_active: Boolean(parseInt(is_active)),
      },
      evaluation_template_contents
    )

    res.json(newEvaluationTemplate)
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
 * Delete a specific evaluation template by ID.
 * @param req.params.id - The unique ID of the evaluation template.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await EvaluationTemplateService.deleteById(parseInt(id))
    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}
