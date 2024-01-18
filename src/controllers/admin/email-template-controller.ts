import { type Request, type Response } from "express"

import * as EmailTemplateService from "../../services/email-template-service"

import { ValidationError } from "yup"
import { addEmailTemplate } from "../../utils/validation/email-template-schema"
import CustomError from "../../utils/custom-error"

export const getDefaultEmailTemplate = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplateService.getDefault()
    res.json(emailTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * List email templates based on provided filters.
 * @param req.query.name - Filter by name.
 * @param req.query.type - Filter by type.
 * @param req.query.page - Page number for pagination.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { name, template_type, is_default, page } = req.query

    const emailTemplates = await EmailTemplateService.getAllByFilters(
      name as string,
      template_type as string,
      is_default as string,
      page as string
    )

    res.json(emailTemplates)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Store a new email template.
 * @param req.body.name - Name.
 * @param req.body.template_type - Template Type.
 * @param req.body.is_default - Is Default.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 */
export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const currentDate = new Date()

    const { name, template_type, is_default, subject, content } = req.body

    await addEmailTemplate.validate({
      name,
      template_type,
      subject,
      content,
    })

    const newTemplate = await EmailTemplateService.create({
      name,
      template_type,
      is_default,
      subject,
      content,
      created_by_id: user.id,
      created_at: currentDate,
    })

    res.json(newTemplate)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get a specific email template by ID.
 * @param req.params.id - The unique ID of the email template.
 */
export const show = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const emailTemplate = await EmailTemplateService.getById(parseInt(id))
    res.json(emailTemplate)
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Update an existing email template by ID.
 * @param req.body.name - Name.
 * @param req.body.template_type - Template Type.
 * @param req.body.is_default - Is Default.
 * @param req.body.subject - Subject.
 * @param req.body.content - Content.
 */
export const update = async (req: Request, res: Response) => {
  try {
    const user = req.user

    const { id } = req.params

    const currentDate = new Date()

    const { name, template_type, is_default, subject, content } = req.body

    await addEmailTemplate.validate({
      name,
      template_type,
      subject,
      content,
    })

    const updateEmailTemplate = await EmailTemplateService.updateById(parseInt(id), {
      name,
      template_type,
      content,
      subject,
      is_default,
      updated_by_id: user.id,
      updated_at: currentDate,
    })

    res.json(updateEmailTemplate)
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(error)
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Delete a specific email template by ID.
 * @param req.params.id - The unique ID of the email template.
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await EmailTemplateService.deleteById(parseInt(id))

    res.json({ id })
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.status).json({ message: error.message })
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

/**
 * Get all unique template type.
 */
export const listTemplateType = async (req: Request, res: Response) => {
  try {
    const emailTemplate = await EmailTemplateService.getTemplateTypes()
    res.json(emailTemplate)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
